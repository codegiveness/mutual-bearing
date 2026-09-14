# Publishing Mutual Bearing

This checkout can be prepared locally without creating a hosting account, uploading files, or making anything public. Repository name: **mutual-bearing**. Publication is a separate owner decision.

## Public and local boundary

The root `.gitignore` is a public-file allowlist. It includes the policy, both skills and their licenses, contributor instructions, documentation, synthetic evaluation fixtures, setup regressions, sync script, and CI workflow. New files are ignored by default—even new documentation. Review their contents and explicitly extend the allowlist when adding public files.

Keep these local:

- `evaluation/evidence/`, `evaluation/archive/`, `evaluation/RESULTS.md`, and local runs: historical outputs, snapshots, and environment details. Preserve originals; a public clone intentionally does not contain them.
- Credentials, `.env` files, keys, tokens, host/provider configuration, and personal instruction files.
- Real conversations, customer data, machine paths, caches, virtual environments, and editor/workspace settings.

The contributor `AGENTS.md` in this repository is public project policy, not personal host configuration and not the adopter payload. Required copyright notices stay in every license.

An ignore file is not a secret scanner: it cannot stop secrets pasted into an allowed file, undo an earlier commit, or prevent `git add -f`. Do not force-add private material. Audit any newly introduced archives separately. Git also publishes commit author names and email addresses; choose your intended public identity, such as your hosting provider's verified no-reply address, **before** committing.

## Before the first upload

Run from the repository root:

```sh
node scripts/sync-guidance.mjs --check
node --test evaluation/setup.test.mjs

git add .
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Review every staged file and the full staged diff, not just filenames. For later releases, also review the entire tracked tree and history; unchanged committed secrets will not appear in the staged diff:

```sh
git ls-files
git log --all --format=fuller
```

Use a maintained secret scanner against the full history before publication. Automated scans reduce risk but do not replace content review. If a credential entered a commit, revoke/rotate it first and clean the history before uploading; deleting the current file is insufficient.

After setting your deliberate public author identity, create the local commit:

```sh
git commit -m "Prepare Mutual Bearing public kit"
```

Create an **empty private repository** named `mutual-bearing` on your chosen host first. Do not initialize a second README or license there. Add its exact URL as `origin`, push `main`, and inspect the hosted files and CI results while still private. These steps upload data; run them only when you authorize that transfer. Make the repository public only after review. No repository URL or account name is assumed by this project.

GitHub's included workflow checks guidance synchronization and installer safeguards on Linux and Windows with Node.js 22 and 24. It does not run paid model evaluations or upload conversation artifacts. Local success is not proof that hosted CI or native host loading passed.

## Launch presentation

Suggested repository description:

> Persistent guidance and focused skills for AI agents that carry goals, constraints, and corrections into the work.

Suggested topics: `ai-agents`, `agent-skills`, `human-ai-collaboration`, `prompt-engineering`, `developer-tools`.

Once the public URL exists:

1. Put that URL in the README installation example in place of the local source checkout, and verify installation into a disposable project from the published source.
2. Record a short synthetic demonstration: initial request, artifact, correction, updated artifact. Show actual work, not a staged claim of perfect understanding. Never use a real conversation without explicit consent and privacy review.
3. Publish a tagged release with installation steps, changes, verified environments, and known limitations. Do not imply historical model results validate newer guidance.
4. Share the demonstration with relevant agent-tool communities where self-promotion is permitted. Explain the narrow problem it addresses; avoid spam, invented testimonials, or guaranteed-outcome claims.
5. Invite redacted reproducible failures and host-integration reports. Track installation success and useful contributions rather than treating stars as evidence of correctness.

Popularity is not guaranteed. Clear positioning, a short path to a verified result, honest limitations, and maintained responses make adoption easier without overstating what guidance can do.
