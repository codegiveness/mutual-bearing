# Installation and host boundaries

The standard installation delivers the complete kit: persistent guidance, setup, and repair. Installation is explicit; subsequent ordinary requests need no activation phrase or mandatory prompt rewriting. No independently installed skill or user-global configuration is changed by Mutual Bearing's setup command.

## Install the skill kit

Use Node.js and npm. From the **adopting project's root**, point the Skills CLI at this checkout:

```sh
npx skills@latest add /path/to/MutualBearing --skill '*' --agent universal
```

Replace the local source path with the actual checkout, or a published Git repository URL when one is available. The project does not assume an unverified public repository slug or npm package. To preview the source's skill catalog, use the same command with `--list`.

The [Skills CLI](https://github.com/vercel-labs/skills) obtains the installer through npm and installs the skill directories under `.agents/skills`. `--skill '*'` selects the complete kit; do not substitute `--all`, which also selects every agent and skips confirmations. Use `--copy` if symlinks are unsuitable. The external CLI may populate npm caches and has its own telemetry controls; `DISABLE_TELEMETRY=1` disables its documented telemetry.

Oh My Pi natively supports project `.agents/skills` through its `agents` provider. Use the `universal` installation target, not `pi`, whose destination is `.pi`. Discovery remains subject to provider settings, skill filters, and same-name precedence. Hosts that do not read `.agents/skills` need the corresponding supported Skills CLI agent target; verify that host's documented discovery rather than assuming universal compatibility.

## Integrate persistent guidance

Installing a skill does not execute its scripts or modify `AGENTS.md`. Run the bundled setup command once:

```sh
node .agents/skills/mutual-bearing-setup/scripts/setup.mjs install --project .
```

Alternatively, explicitly ask the installed setup skill to configure Mutual Bearing in the named project. It uses the same command and ownership rules; it is not a second installer implementation.

The default target is the adopting project's `AGENTS.md`. The whole canonical [GUIDANCE.md](../GUIDANCE.md), including its `BEGIN MUTUAL BEARING` and `END MUTUAL BEARING` markers, is the only behavioral block installed. This source repository's root `AGENTS.md` is contributor-only and must not be copied as the payload.

When a host actually loads a different project instruction surface, select it explicitly:

```sh
node .agents/skills/mutual-bearing-setup/scripts/setup.mjs install --project . --instructions .omp/AGENTS.md
```

That example is appropriate when `.omp/AGENTS.md` is the existing loaded surface. Do not create a higher-priority file merely to make loading work: it can shadow unrelated instructions. In Oh My Pi, context files at the same directory depth compete by provider precedence; an existing native `.omp/AGENTS.md` can shadow root `AGENTS.md`. Settings and nearer project directories can affect discovery too. Inspect the actual host context and select the correct file before integration.

Setup requires an explicit existing project directory and confines the chosen instruction file to it. It records ownership under `.mutual-bearing/setup.json`, preserves unrelated text, and refuses ambiguous markers, unsafe paths, unknown conflicting blocks, or local edits to its owned block. It does not merge away local policy decisions or provide a destructive force option. Resolve conflicts with the human while preserving unaffected instructions.

## Verify configuration and loading separately

```sh
node .agents/skills/mutual-bearing-setup/scripts/setup.mjs check --project .
```

This checks **on-disk guidance and ownership**, not skill discovery or runtime activation. Confirm both skills are installed, then reload or start the host in the adopting project and inspect its documented context/discovery output. Verify that the expanded guidance and both skill descriptions are actually present and that another installed copy does not win by precedence. Model self-report or a file existing on disk is not proof.

The setup command does not manufacture a host capability or set a global provider toggle. If the host cannot load instructions or skills, report that boundary rather than declaring the kit active. The core still expresses complete responsibilities when skills are missing; this resilience does not make an incomplete kit installation complete.

## Updates, migration, and removal

Update both project-owned skill directories through the Skills CLI or replace them from the selected source while preserving local changes. Then rerun the setup `install` command from the updated skill. An unchanged recorded block can be replaced in place; an identical repeat is a no-op. Keep `.mutual-bearing/setup.json` with the installed instructions so future setup can distinguish owned content from local edits.

An old manual installation with no ownership record can be adopted only when its marked block exactly matches the current payload. Unknown or edited versions require explicit reconciliation; setup must not infer permission from similar-looking text. The historical archives provide previous-version evidence but are never loaded as current instructions. Independently installed tools and skills remain outside this migration's editing scope.

Remove the owned guidance first:

```sh
node .agents/skills/mutual-bearing-setup/scripts/setup.mjs remove --project .
```

Then remove the two project skills with the Skills CLI's project-scoped remove command, selecting `mutual-bearing-setup` and `mutual-bearing-repair` only. Do not remove unrelated skills or global copies. Reload the host. Setup removes only its unchanged recorded block and owned state, preserving other text and files; edited content requires reconciliation instead of silent deletion.

No Mutual Bearing service, background process, or separately published npm runtime is installed. npm cache management belongs to npm, not the setup script.

## Maintaining the bundled payload

Edit only canonical `GUIDANCE.md`, then synchronize its self-contained setup resource:

```sh
node scripts/sync-guidance.mjs
node scripts/sync-guidance.mjs --check
```

The generated `skills/mutual-bearing-setup/assets/GUIDANCE.md` must be byte-identical to the source. It is a distribution copy, not an independently maintained policy. Skill-relative resources stay inside the setup directory so a copied installation does not depend on the source checkout.

## Responsibilities versus delivery capabilities

| Situation | Agent responsibility | Host dependency |
|---|---|---|
| Initial or ordinary request | Interpret in context and respond appropriately without a ritual. | The persistent guidance must already be loaded. |
| Steering during work | Reconsider pending actions as soon as new input is delivered. | The host controls delivery timing and may queue input. |
| Correction or changed direction | Update affected work while retaining unaffected decisions. | Relevant context must be available or recoverable. |
| Running tool or completed external effect | Report actual state, stop invalidated future actions, and repair within authority. | Cancellation and rollback are distinct capabilities. |
| Compaction, resume, or delegation | Carry relevant decisions, uncertainty, permissions, and work status. | The host must preserve or reload the necessary context. |
| Missing or misselected skill | Use an adequate available method or name the precise limit. | Discovery, filtering, precedence, and tool access are host-specific. |

A custom adapter is justified only by a demonstrated gap in a supported host. This kit uses native instruction and skill discovery; it does not intercept or replace user messages, bypass safeguards, or promise immediate interruption.

## Evidence boundary

The [evaluation driver](../evaluation/README.md) explicitly supplies the policy and skill catalog and performs isolated file operations. It is test machinery, not a production installation hook. It tests direct action, uncertainty, correction, and skill selection under those conditions. Native installation/loading evidence must be recorded separately. Historical results remain local pending [publication review](publishing.md); they are not included in the public checkout.

Historical files in `evaluation/archive/` and older evidence records remain immutable snapshots of their own designs. Their results do not validate the revised ecosystem, a different host configuration, human agreement, or universally problem-free work.
