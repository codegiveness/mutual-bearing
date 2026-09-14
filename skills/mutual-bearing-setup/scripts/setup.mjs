#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

const BEGIN = '<!-- BEGIN MUTUAL BEARING -->';
const END = '<!-- END MUTUAL BEARING -->';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
let outcome;
const report = (status, extra = {}) => { outcome = { status, runtimeLoading: 'unverified', ...extra }; };
async function stat(file) {
  try { return await fs.lstat(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function safePath(root, relative) {
  if (!relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(part => part === '..' || part === '.' || !part)) fail('Instructions must be a normalized project-relative path.');
  const parts = relative.split('/');
  let current = root;
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    const info = await stat(current);
    if (info?.isSymbolicLink()) fail('Symlinks are not managed.');
    if (i < parts.length - 1 && !info?.isDirectory()) fail('Instruction parent directory must already exist.');
    if (i === parts.length - 1 && info && !info.isFile()) fail('Managed target must be a regular file.');
  }
  return current;
}
async function bytes(file) { return await stat(file) ? fs.readFile(file) : Buffer.alloc(0); }
function marked(content) {
  const token = Buffer.from('MUTUAL BEARING');
  const hits = [];
  for (let offset = 0; ; ) {
    const index = content.indexOf(token, offset);
    if (index < 0) break;
    // Only marker-like uses are reserved, not ordinary prose mentions.
    const lineStart = content.lastIndexOf(10, index) + 1;
    const next = content.indexOf(10, index);
    const line = content.subarray(lineStart, next < 0 ? content.length : next).toString('utf8').replace(/\r$/, '');
    if (/BEGIN.*MUTUAL BEARING|END.*MUTUAL BEARING/.test(line)) hits.push({ line, start: lineStart, end: next < 0 ? content.length : next + 1 });
    offset = index + token.length;
  }
  if (!hits.length) return null;
  if (hits.length !== 2 || hits[0].line !== BEGIN || hits[1].line !== END) fail('Ambiguous, repeated, or malformed Mutual Bearing markers.');
  return { start: hits[0].start, end: hits[1].end, block: content.subarray(hits[0].start, hits[1].end) };
}
async function atomic(file, content) {
  const info = await stat(file);
  if (info && (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1)) fail('Unsafe managed file type or hard link.');
  const temporary = path.join(path.dirname(file), `.mutual-bearing-${randomUUID()}.tmp`);
  let handle;
  try {
    handle = await fs.open(temporary, 'wx', info ? info.mode & 0o777 : 0o600);
    await handle.writeFile(content);
    if (info) await handle.chmod(info.mode & 0o777);
    await handle.sync();
    await handle.close(); handle = null;
    await fs.rename(temporary, file);
  } finally {
    await handle?.close();
    await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}
function validateState(value) {
  if (!value || Array.isArray(value) || Object.keys(value).sort().join(',') !== 'blockHash,created,instructions,padding,version' || value.version !== 1 || typeof value.instructions !== 'string' || typeof value.blockHash !== 'string' || !/^[a-f0-9]{64}$/.test(value.blockHash) || typeof value.created !== 'boolean' || !['', '\n', '\n\n'].includes(value.padding)) fail('Malformed setup state.');
  return value;
}
async function run() {
  const [operation, ...args] = process.argv.slice(2);
  if (!['install', 'check', 'remove'].includes(operation)) fail('Usage: setup.mjs install|check|remove --project PATH [--instructions RELATIVE_PATH]');
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--project', '--instructions'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || Object.hasOwn(options, args[i])) fail('Invalid or repeated option.');
    options[args[i]] = args[i + 1];
  }
  if (!options['--project']) fail('An explicit --project is required.');
  const root = await fs.realpath(path.resolve(options['--project']));
  if (!(await fs.stat(root)).isDirectory()) fail('Project must be an existing directory.');
  const directory = path.join(root, '.mutual-bearing');
  const directoryInfo = await stat(directory);
  if (directoryInfo && (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink())) fail('Unsafe setup state directory.');
  let lock;
  try {
    if (operation !== 'check') {
      await fs.mkdir(directory, { recursive: false }).catch(error => { if (error.code !== 'EEXIST') throw error; });
      lock = await fs.open(path.join(directory, 'setup.lock'), 'wx', 0o600);
    }
    const stateFile = await safePath(root, '.mutual-bearing/setup.json').catch(error => {
      if (!directoryInfo && operation === 'check') return null;
      throw error;
    });
    const stateInfo = stateFile && await stat(stateFile);
    if (stateInfo && stateInfo.nlink !== 1) fail('Hard-linked state is not managed.');
    const state = stateInfo ? validateState(JSON.parse(await fs.readFile(stateFile, 'utf8'))) : null;
    const relative = options['--instructions'] ?? state?.instructions ?? 'AGENTS.md';
    if (relative.split('/')[0] === '.mutual-bearing') fail('Instructions cannot target setup state.');
    if (state && state.instructions !== relative) fail('Instruction target differs from recorded ownership.');
    const target = await safePath(root, relative);
    const targetInfo = await stat(target);
    if (targetInfo && targetInfo.nlink !== 1) fail('Hard-linked instructions are not managed.');
    const original = await bytes(target);
    const found = marked(original);
    if (state && (!found || digest(found.block) !== state.blockHash || found.start < Buffer.byteLength(state.padding) || !original.subarray(found.start - Buffer.byteLength(state.padding), found.start).equals(Buffer.from(state.padding)))) fail('Recorded block was locally edited or removed; refusing to overwrite it.');
    let canonical;
    if (operation !== 'remove') {
      canonical = await fs.readFile(new URL('../assets/GUIDANCE.md', import.meta.url));
      const parsed = marked(canonical);
      if (!parsed || parsed.start !== 0 || parsed.end !== canonical.length) fail('Bundled guidance must be one complete marked block.');
    }
    if (!state && found && operation !== 'remove' && !found.block.equals(canonical)) fail('Unknown marked block differs from bundled guidance.');
    if (operation === 'check') {
      const status = !found ? 'absent' : found.block.equals(canonical) ? 'current' : 'stale';
      report(status, { instructions: relative, owned: Boolean(state) });
      if (status !== 'current') process.exitCode = 1;
      return;
    }
    if (operation === 'remove') {
      if (!state) {
        if (found) fail('Marked block has no recorded ownership; install to adopt an exact-current block first.');
        report('absent', { instructions: relative }); return;
      }
      const remaining = Buffer.concat([original.subarray(0, found.start - Buffer.byteLength(state.padding)), original.subarray(found.end)]);
      if (!remaining.length && state.created) await fs.unlink(target);
      else await atomic(target, remaining);
      await fs.unlink(stateFile);
      report('removed', { instructions: relative });
      return;
    }
    const padding = state?.padding ?? (found || !original.length ? '' : original.at(-1) === 10 ? '\n' : '\n\n');
    const next = found ? Buffer.concat([original.subarray(0, found.start), canonical, original.subarray(found.end)]) : Buffer.concat([original, Buffer.from(padding), canonical]);
    const nextState = { version: 1, instructions: relative, blockHash: digest(canonical), padding, created: state?.created ?? !targetInfo };
    if (!original.equals(next)) await atomic(target, next);
    if (!state || JSON.stringify(state) !== JSON.stringify(nextState)) await atomic(stateFile, `${JSON.stringify(nextState)}\n`);
    report('current', { instructions: relative, changed: !original.equals(next), owned: true });
  } finally {
    if (lock) {
      await lock.close();
      await fs.unlink(path.join(directory, 'setup.lock'));
      await fs.rmdir(directory).catch(error => { if (!['ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error; });
    }
  }
}
run().then(() => console.log(JSON.stringify(outcome))).catch(error => {
  report(process.argv[2] === 'check' ? 'conflicting' : 'error', { error: error.message });
  console.log(JSON.stringify(outcome));
  process.exitCode = 1;
});
