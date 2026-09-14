# Mutual Bearing

[![Checks](https://github.com/codegiveness/mutual-bearing/actions/workflows/checks.yml/badge.svg)](https://github.com/codegiveness/mutual-bearing/actions/workflows/checks.yml)

A guidance-and-skills kit for working with AI agents across requests, follow-ups, and corrections. It aims to keep the work aligned with your goals—not just make the next reply sound aligned.

Use it when an agent helps with coding, writing, research, or other multi-step work and you want context and corrections to reach the actual deliverables. It is for people and teams using a host that can load persistent project instructions and skills; it is not a standalone agent, model, or runtime.

“Mutual bearing” means the human and agent can recognize the direction of the work, notice when their understandings diverge, and correct course together. The agent carries interpretation, investigation, execution, and repair; the human retains their goals and authority.

## One ecosystem, distinct responsibilities

| Component | Responsibility |
|---|---|
| [GUIDANCE.md](GUIDANCE.md) in the host's instruction surface | The single complete behavioral policy: interpret in context, notice consequential uncertainty, act faithfully, and carry corrections into the work. |
| [Setup skill](skills/mutual-bearing-setup/SKILL.md) | Integrate, check, update, or remove the project-owned guidance safely. Installation is explicit, not something ordinary requests trigger. |
| [Repair skill](skills/mutual-bearing-repair/SKILL.md) | Diagnose an unresolved collaboration mismatch and repair its consequences. An evident correction goes directly into the work. |
| Human prompts and feedback | Supply and revise the goal, relevant context, constraints, and delegation. No special syntax or mandatory prompt rewrite. |
| Host | Load instructions and skills, deliver messages, and provide tools. Those capabilities must be verified rather than assumed. |

**Install the kit together; load each skill only when relevant.** Skills are first-class parts of the standard adoption, not separate policies or a compulsory pipeline. Other independently installed skills can contribute to their specialties; no external prompt editor or skill is required.

## Quickstart

With Node.js and npm available, run these commands **in the project adopting Mutual Bearing**:

```sh
npx skills@latest add codegiveness/mutual-bearing --skill '*' --agent universal
node .agents/skills/mutual-bearing-setup/scripts/setup.mjs install --project .
```

The [Skills CLI](https://github.com/vercel-labs/skills) installs both skill directories under `.agents/skills`. npm supplies that CLI; Mutual Bearing does not need a separate npm package. Use `--copy` if symlinks are unsuitable. For an offline source checkout, replace `codegiveness/mutual-bearing` with its local path.

Setup integrates the canonical guidance into `AGENTS.md`, preserving unrelated text. If your host actually loads another project instruction file, select it explicitly with `--instructions relative/path`. Do not create a higher-priority instruction file that silently shadows existing project rules. This repository's own root `AGENTS.md` is contributor guidance, **not** the adopter payload.

Reload the host and confirm that it loads both the guidance and skill metadata. A successful setup command establishes on-disk configuration, not runtime activation. Oh My Pi supports the project `.agents/skills` convention; its `pi` installer target is unnecessary and refers to a different host's paths. See [host boundaries, updates, and removal](docs/integration.md).

## Work normally

A clear request should produce direct work. An accessible unknown calls for investigation; an unresolved consequential choice calls for a question. A follow-up updates the existing understanding, and a correction reaches affected artifacts rather than just the next apology. When exploration or planning is the requested endpoint, implementation remains outside scope.

You can express scope in ordinary language:

> Finish the local report from the available evidence. Preserve the source data; do not publish it. Ask if a choice changes the result in a way we have not settled.

This is an example, not required wording. The agent should also help when intent is incomplete or still forming. A request to compose a prompt produces that prompt, not its downstream result.

For example, suppose a report and its summary count households. You correct the unit: “Count people, not households; keep the source data unchanged.” The intended result is a recalculation from the available data and an update to both artifacts—not merely an acknowledgment or a corrected sentence in chat. If the data cannot establish the number of people, the agent should make that limitation explicit. This illustrates the intended behavior, not a guarantee that every model will achieve it.

## What success means

The target is useful work without unsupported claims, unfinished deliverables, avoidable mistakes, unnecessary complexity, unjustified certainty, or ignored context and corrections. When a failure occurs, identify its supported cause and repair the actual consequences.

Labels such as “hallucinating,” “lazy,” or “dumb” do not establish a cause. Human context and feedback affect results, but model capability, evidence, tools, and host delivery matter too. The kit must not blame imperfect prompting or promise universally problem-free output. [Diagnosis](docs/diagnosis.md) explains those distinctions.

The [evaluation method](evaluation/README.md) uses a no-skills primary condition to check core responsibilities, with full-kit sessions for skill selection and repair. These are bounded synthetic sessions, not proof of general reliability or native host loading. Historical raw evidence and result records remain local pending publication review; they are not included in the public materials. The public method is not a claim that the current kit has passed every case.

## Design and limits

- [Architecture](docs/design.md): orchestration without duplicate policies or compulsory stages.
- [Integration](docs/integration.md): ownership, actual host loading, migration, and removal.
- [Evaluation](evaluation/README.md): observable outcomes rather than claims of understanding.

Guidance cannot read an undelivered message, recover unavailable history, interrupt every running response, or reverse a completed effect. Historical records are immutable evidence, not current instructions or proof of the revised kit.

## Contribute or prepare a release

See [CONTRIBUTING.md](CONTRIBUTING.md) for focused changes, local checks, and privacy-safe bug reports. The [publication guide](docs/publishing.md) covers preparing a reviewed public snapshot; installing locally does not require publishing anything.

[MIT license](LICENSE). Required copyright notices are retained.
