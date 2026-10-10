# Developing Mutual Bearing

`GUIDANCE.md` is the canonical behavioral policy: a compact contract that setup installs into an adopter's instruction file and that the agent reads on every turn. The kit also ships `skills/mutual-bearing-setup` (explicit install, update, removal, and loading diagnosis) and `skills/mutual-bearing-repair` (focused collaboration diagnosis). This file is for contributors only; never copy it into an adopting project.

## Rules

- Keep the project standalone: no external skill dependency, mandatory prompt-rewriting step, or second behavioral policy in the documentation. Skills are installed together and loaded selectively; setup is explicit, and repair adds diagnostic depth without being required for the core responsibilities.
- Edit policy only in `GUIDANCE.md`, then run `node scripts/sync-guidance.mjs`. Never hand-edit `skills/mutual-bearing-setup/assets/GUIDANCE.md`.
- Keep `GUIDANCE.md` a compact contract as described in `docs/design.md`: each rule names a situation and the action, any reflex it names comes with what to do instead, and skills are referenced by function. Put rationale and examples in `docs/`, not in the guidance.
- Use `docs/design.md` for architectural boundaries, `docs/diagnosis.md` for awareness and repair distinctions, and `docs/integration.md` for adoption. Explain the project's own behavior rather than cataloguing inspirations. Preserve required copyright notices in the license files.
- Preserve the user's goals, authority, and meaningful constraints when changing wording. Universal applicability is an objective, not proof of complete awareness, host loading, automatic interruption, or human agreement.
- Source material and independently installed tools outside this checkout are outside the editing scope.

## Checks

```sh
node scripts/sync-guidance.mjs --check
node --test evaluation/setup.test.mjs
```

CI runs both on Linux and Windows with Node.js 22 and 24.

## Behavioral changes need exercised sessions

Follow `evaluation/README.md`. Run the no-skills `core` condition, the `kit` condition for skill selection, and `baseline`, and compare against the previous payload on the same cases, including already-clear controls. Judge observable work failures, not labels about intelligence, effort, or blame; human context matters without guaranteeing results or making the human responsible for model limitations. When a revision suppresses one failure, check related cases for side effects. Keep raw outputs and failures, and distinguish fixture skill delivery from native installation and loading. Historical archives are immutable evidence, not current instructions or proof of revised behavior. Documentation-only edits need no model runs, and conversation data is never published to justify one.

## Repository mechanics

- `.gitignore` is a public allowlist. A new file stays untracked until you add an explicit allowlist entry; check `git status --ignored` after adding files.
- `evaluation/RESULTS.md`, `evaluation/evidence/`, and `evaluation/archive/` are local-only, so a `git worktree` checkout does not contain them. Write new evidence into the main checkout's `evaluation/evidence/<run>/`.
- `evaluation/run.py` reads `GUIDANCE.md` and the skills relative to its own checkout. Loading it from a worktree evaluates that worktree's payload, which makes side-by-side comparison with the main checkout straightforward.
