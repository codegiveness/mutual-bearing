import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const source = new URL('../skills/mutual-bearing-setup/scripts/setup.mjs', import.meta.url);
const begin = '<!-- BEGIN MUTUAL BEARING -->';
const end = '<!-- END MUTUAL BEARING -->';
const block = guidance => `${begin}\n${guidance}\n${end}\n`;
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mutual-bearing-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project');
  const scripts = path.join(root, 'skill', 'scripts');
  const assets = path.join(root, 'skill', 'assets');
  await Promise.all([fs.mkdir(project), fs.mkdir(scripts, { recursive: true }), fs.mkdir(assets, { recursive: true })]);
  const cli = path.join(scripts, 'setup.mjs');
  const guidance = path.join(assets, 'GUIDANCE.md');
  await fs.copyFile(source, cli);
  await fs.writeFile(guidance, block('Policy one.'));
  return {
    root, project, guidance,
    target: path.join(project, 'AGENTS.md'),
    state: path.join(project, '.mutual-bearing', 'setup.json'),
    run(operation, ...args) {
      const result = spawnSync(process.execPath, [cli, operation, '--project', project, ...args], { encoding: 'utf8' });
      assert.ifError(result.error);
      return { code: result.status, report: JSON.parse(result.stdout) };
    },
  };
}

test('install and remove preserve unrelated bytes, including later additions; reinstall is idempotent', async t => {
  const f = await fixture(t);
  const original = Buffer.from([0xff, 0x00, 0x41, 0x0d, 0x0a]);
  await fs.writeFile(f.target, original);
  assert.equal(f.run('install').code, 0);
  const installed = await fs.readFile(f.target);
  assert.deepEqual(installed.subarray(0, original.length), original);
  assert.equal(f.run('install').code, 0);
  assert.deepEqual(await fs.readFile(f.target), installed);
  const suffix = Buffer.from('\nUser-added instructions.\r\n');
  await fs.appendFile(f.target, suffix);
  await fs.writeFile(path.join(f.project, '.mutual-bearing', 'unrelated'), 'keep');
  assert.equal(f.run('remove').code, 0);
  assert.deepEqual(await fs.readFile(f.target), Buffer.concat([original, suffix]));
  assert.equal(await fs.readFile(path.join(f.project, '.mutual-bearing', 'unrelated'), 'utf8'), 'keep');
  await assert.rejects(fs.stat(f.state), { code: 'ENOENT' });
});

test('remove deletes only a created empty instruction file, not a preexisting empty file', async t => {
  for (const preexisting of [false, true]) {
    const f = await fixture(t);
    if (preexisting) await fs.writeFile(f.target, '');
    assert.equal(f.run('install').code, 0);
    assert.equal(f.run('remove').code, 0);
    if (preexisting) assert.deepEqual(await fs.readFile(f.target), Buffer.alloc(0));
    else await assert.rejects(fs.stat(f.target), { code: 'ENOENT' });
  }
});

test('locally edited owned blocks refuse install, check, and removal without changing bytes', async t => {
  const f = await fixture(t);
  assert.equal(f.run('install').code, 0);
  const modified = (await fs.readFile(f.target, 'utf8')).replace('Policy one.', 'My modified policy.');
  await fs.writeFile(f.target, modified);
  const state = await fs.readFile(f.state);
  for (const operation of ['install', 'check', 'remove']) {
    assert.notEqual(f.run(operation).code, 0);
    assert.equal(await fs.readFile(f.target, 'utf8'), modified);
    assert.deepEqual(await fs.readFile(f.state), state);
  }
});

test('malformed, reversed, repeated, and unknown blocks cannot be overwritten or removed', async t => {
  for (const content of [begin, end, `${end}\n${begin}\n`, block('Unknown policy'), block('Policy one.') + block('Policy one.'), `prefix ${begin}\nPolicy one.\n${end}\n`, `${begin}\n${begin}\n${end}\n`]) {
    const f = await fixture(t);
    await fs.writeFile(f.target, content);
    for (const operation of ['install', 'check', 'remove']) {
      assert.notEqual(f.run(operation).code, 0);
      assert.equal(await fs.readFile(f.target, 'utf8'), content);
    }
  }
});

test('paths cannot traverse, follow file or directory symlinks, or overwrite setup state', async t => {
  const f = await fixture(t);
  const outside = path.join(f.root, 'outside');
  await fs.mkdir(outside);
  const protectedFile = path.join(outside, 'AGENTS.md');
  await fs.writeFile(protectedFile, 'untouched');
  await fs.symlink(outside, path.join(f.project, 'linked'));
  await fs.symlink(protectedFile, f.target);
  for (const target of ['../outside/AGENTS.md', protectedFile, 'linked/AGENTS.md', 'AGENTS.md', '.mutual-bearing/setup.json']) {
    assert.notEqual(f.run('install', '--instructions', target).code, 0);
    assert.equal(await fs.readFile(protectedFile, 'utf8'), 'untouched');
  }
  await fs.symlink(outside, path.join(f.project, '.mutual-bearing'));
  assert.notEqual(f.run('install', '--instructions', 'safe.md').code, 0);
  await assert.rejects(fs.stat(path.join(f.project, 'safe.md')), { code: 'ENOENT' });
});

test('unchanged owned blocks update safely and check distinguishes disk states', async t => {
  const f = await fixture(t);
  assert.equal(f.run('check').report.status, 'absent');
  await fs.writeFile(f.target, 'Before\r\n');
  assert.equal(f.run('install').code, 0);
  await fs.appendFile(f.target, 'After\r\n');
  await fs.writeFile(f.guidance, block('Policy two.'));
  const stale = f.run('check');
  assert.equal(stale.report.status, 'stale');
  assert.notEqual(stale.code, 0);
  assert.equal(f.run('install').code, 0);
  assert.equal(await fs.readFile(f.target, 'utf8'), `Before\r\n\n${block('Policy two.')}After\r\n`);
  const current = f.run('check');
  assert.equal(current.code, 0);
  assert.equal(current.report.status, 'current');
  assert.equal(current.report.runtimeLoading, 'unverified');
  assert.equal(f.run('remove').code, 0);
  assert.equal(await fs.readFile(f.target, 'utf8'), 'Before\r\nAfter\r\n');
});

test('exact-current unmanaged blocks are adopted without changing surrounding bytes', async t => {
  const f = await fixture(t);
  const content = `Before\n\n${block('Policy one.')}\nAfter`;
  await fs.writeFile(f.target, content);
  assert.equal(f.run('check').report.owned, false);
  assert.notEqual(f.run('remove').code, 0);
  assert.equal(f.run('install').code, 0);
  assert.equal(await fs.readFile(f.target, 'utf8'), content);
  assert.equal(f.run('remove').code, 0);
  assert.equal(await fs.readFile(f.target, 'utf8'), 'Before\n\n\nAfter');
});

test('recorded target changes and malformed ownership state refuse mutation', async t => {
  const f = await fixture(t);
  assert.equal(f.run('install').code, 0);
  const installed = await fs.readFile(f.target);
  assert.notEqual(f.run('install', '--instructions', 'OTHER.md').code, 0);
  await assert.rejects(fs.stat(path.join(f.project, 'OTHER.md')), { code: 'ENOENT' });
  await fs.writeFile(f.state, '{"version":1}');
  for (const operation of ['install', 'check', 'remove']) assert.notEqual(f.run(operation).code, 0);
  assert.deepEqual(await fs.readFile(f.target), installed);
  assert.equal(await fs.readFile(f.state, 'utf8'), '{"version":1}');
});

test('atomic replacement preserves existing permissions under a restrictive umask', { skip: process.platform === 'win32' }, async t => {
  const f = await fixture(t);
  await fs.writeFile(f.target, 'Shared project instructions.\n');
  await fs.chmod(f.target, 0o664);
  for (const operation of ['install', 'remove']) {
    const previous = process.umask(0o077);
    let result;
    try { result = f.run(operation); } finally { process.umask(previous); }
    assert.equal(result.code, 0);
    assert.equal((await fs.stat(f.target)).mode & 0o777, 0o664);
  }
});
