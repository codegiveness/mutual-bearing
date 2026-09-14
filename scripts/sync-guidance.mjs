#!/usr/bin/env node
import { readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const source = new URL('../GUIDANCE.md', import.meta.url);
const target = new URL('../skills/mutual-bearing-setup/assets/GUIDANCE.md', import.meta.url);
try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 1 || args[0] !== '--check')) throw new Error('Usage: sync-guidance.mjs [--check]');
  const canonical = await readFile(source);
  let bundled;
  try { bundled = await readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (args[0] === '--check') {
    if (!bundled?.equals(canonical)) throw new Error('Bundled GUIDANCE.md is missing or differs from canonical GUIDANCE.md. Run node scripts/sync-guidance.mjs.');
  } else if (!bundled?.equals(canonical)) {
    await mkdir(new URL('.', target), { recursive: true });
    const temporary = new URL(`.${randomUUID()}.tmp`, target);
    try {
      await writeFile(temporary, canonical, { flag: 'wx' });
      await rename(temporary, target);
    } finally {
      await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  console.log('Bundled guidance matches canonical GUIDANCE.md.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
