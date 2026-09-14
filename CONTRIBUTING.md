# Contributing to Mutual Bearing

Start with the repository's [AGENTS.md](AGENTS.md) for contributor instructions and [design notes](docs/design.md) for component boundaries. [GUIDANCE.md](GUIDANCE.md) is the single canonical behavioral policy; this guide does not add another one.

## Make a focused change

- Explain the concrete problem, intended outcome, and affected files. Keep unrelated changes separate.
- Edit canonical guidance only in `GUIDANCE.md`, then refresh its bundled copy with the sync command below. Do not hand-edit the setup skill's guidance resource.
- Keep setup and repair responsibilities distinct, preserve unrelated adopter instructions, and update relevant documentation when behavior changes.
- Preserve license notices. Do not rewrite historical evidence or archives to match a new implementation.

## Local checks

Use Node.js with the built-in test runner. Run these commands from this repository's root:

```sh
# After editing canonical guidance, refresh the distribution resource.
node scripts/sync-guidance.mjs

# Check that the bundled resource is byte-identical without changing it.
node scripts/sync-guidance.mjs --check

# Exercise setup ownership, preservation, and destructive-boundary regressions.
node --test evaluation/setup.test.mjs
```

For setup or installation changes, also exercise the [quickstart](README.md#quickstart) in an isolated adopting project. Check actual host discovery and instruction loading separately: a successful setup command verifies files, not runtime activation.

Changes to guidance or skill behavior require exercised sessions following [evaluation/README.md](evaluation/README.md), including the no-skills primary condition and relevant kit behavior. Record the tested payload and conditions, failures, and observable artifacts; distinguish fixture delivery from native host loading. Documentation-only changes do **not** require model evaluations. Report which checks you ran and any limitations rather than implying broader coverage.

## Report a problem safely

Provide a minimal synthetic, redacted reproduction: the goal, relevant constraints, expected and actual behavior, host/model information if known, and the smallest necessary sample files or commands. For installation problems, include the command and sanitized error output. Do not submit real user transcripts, credentials, secrets, personal identifiers, or private project paths. Replace sensitive details before sharing; do not rely on deletion after publication.

Raw evaluation outputs, historical result records, archives, and local runs stay local pending publication review. Keep failures for local analysis without treating them as automatically safe to publish. See the [publication guide](docs/publishing.md) before preparing any public snapshot or evidence summary.
