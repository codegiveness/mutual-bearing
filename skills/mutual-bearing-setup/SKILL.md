---
name: mutual-bearing-setup
description: Install, update, remove, or diagnose the loading of Mutual Bearing when explicitly requested. Not for everyday task ambiguity, ordinary corrections, or collaboration repair.
license: MIT
---

# Mutual Bearing Setup

Use this skill for one-time project integration or a requested loading diagnosis, not as an ongoing runtime layer. Installing a skill makes its resources discoverable; it does not execute its scripts or activate persistent guidance automatically. Do not change global host configuration or install anything beyond the requested scope.

## Integrate with the actual host

1. Recover the intended project and inspect its existing instruction files and the host's native context and skill discovery rules. Preserve local instructions. Determine which file is actually loaded for the working directory; an existing `AGENTS.md` can be shadowed by higher-priority context, and scoped files can change effective instructions. Do not invent a host registry or assume that every host uses the same filename.
2. If the skills themselves are not yet installed, run `npx skills@latest add /path/to/MutualBearing --skill '*' --agent universal` from the adopting project's root, replacing the source path with the actual checkout. This installs both bundled skills under that project's `.agents/skills`; it does not run this setup script. Run it only when installation is authorized. For Oh My Pi, the agents provider discovers `.agents/skills` by default, subject to host settings; check actual discovery rather than assuming defaults are active.
3. Use this skill's bundled `assets/GUIDANCE.md` through the script below. The source checkout's root `GUIDANCE.md` is canonical; maintainers synchronize its bundled copy with `node scripts/sync-guidance.mjs` and detect drift with `--check`. Do not maintain a second policy by hand.

From any working directory, resolve `<skill-dir>` to this installed skill and use an explicit existing project:

```sh
node <skill-dir>/scripts/setup.mjs install --project /absolute/project
node <skill-dir>/scripts/setup.mjs check --project /absolute/project
node <skill-dir>/scripts/setup.mjs remove --project /absolute/project
```

`--instructions RELATIVE_PATH` selects the host's project instruction file; the first install defaults to `AGENTS.md`, later commands use the recorded path. Its parent directories must already exist. Never select a target just because it exists: first establish the host's loading rules. Paths must be normalized, project-relative, and free of symlink components. The script manages a marked guidance block and minimal `.mutual-bearing/setup.json` ownership state, not the skill installation itself. Removing the block does not uninstall either skill.

## Respect ownership and limits

The script preserves unrelated bytes. Reinstall is idempotent; an update replaces only an unchanged recorded block. An unmanaged block may be adopted only when byte-identical to the current bundle. Local edits, an unknown block, malformed/repeated markers, a changed target, or malformed state are conflicts, not permission to overwrite. There is no force flag. Inspect the conflicting files and recover the intended content from evidence; obtain authorization before manually resolving ownership or removing anything unowned.

Removal deletes only the recorded unchanged block and owned state. It deletes a script-created instruction file only when no other bytes remain, and never recursively removes directories. Do not edit instruction files concurrently with setup. A project-local lock prevents concurrent setup writers, not arbitrary editor writes or adversarial filesystem races. File replacements are atomic individually, not a transaction across the instruction file and state. An interrupted operation may leave a conflict requiring inspection; never delete a lock until establishing that its process is no longer running.

Commands return one small JSON report and nonzero on errors. `check` reports `absent`, `stale`, `conflicting`, or `current` on-disk configuration; absent/stale/conflicting are nonzero. `owned: false` with `current` means the exact block exists but has not been adopted. Every report labels runtime loading `unverified`. Successful writes are not proof of activation.

## Confirm and return

Check the host's actual loaded context and skill metadata, including disabled providers, scope, shadowing, and any required session refresh. Distinguish disk configuration from observed host loading; if inspection is unavailable, say loading remains unverified. Do not promise the guidance makes a model infallible or overrules higher-priority instructions. Once integration is checked or the concrete blocker is identified, return to the original task rather than keeping setup mode active.
