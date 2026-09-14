# Exercising Mutual Bearing

Evaluate how the agent handles ordinary user prompts and changes its work—not whether it emits a polished rewrite or claims to understand. The public checkout includes the method, synthetic cases, and driver, not historical raw results. Maintainer-local `RESULTS.md`, `evidence/`, and `archive/` are excluded from Git pending a separate privacy and publication review; a fresh clone will not contain them. No private user conversations are needed. See the [publication boundary](../docs/publishing.md).

## The primary condition has no skills

[run.py](run.py) is a Python 3.10+ standard-library fixture driver. It accepts an async `respond(system, messages)` callback, supplies a chronological conversation, executes real reads and writes in an isolated temporary directory, records the outcome, and removes that directory. External commitments are simulated; no publication, payment, or message is actually sent.

- `core`: the complete Mutual Bearing guidance plus the fixture protocol, with **no skills available**. This is the primary independence and automatic-handling condition.
- `baseline`: the same protocol and task constraints without the guidance or any skill descriptions.
- `kit`: the core plus discovery descriptions for both bundled skills, `mutual-bearing-setup` and `mutual-bearing-repair`. A requested load supplies only that skill's body. This condition evaluates selective discovery and focused diagnostic depth, not the existence of automatic behavior.

The model chooses one JSON action per response: `read`, `write`, `load_skill`, `ask`, `reply`, or `commit`. Baseline and core-only runs cannot load a skill; requests receive an unavailable result. No external skill or framework is provided. The protocol does not paraphrase the guidance into the baseline.

Full-kit fixture sessions are **not native host setup verification**. The driver injects the canonical guidance and exposes the two descriptions itself; loading a body does not execute the setup script, expose its resource files, install a skill, or establish that a host loaded persistent instructions. There is no shell or host configuration capability in this transport. Verify real project setup, resource synchronization, and actual instruction loading separately. Do not count a setup claim inside this fixture as that evidence.

## What is observable

The current transport uses Oh My Pi Eval's stateless `completion` helper with an explicitly replayed message transcript. This is **not native multi-turn tool calling**. Each completion receives the requested system text and accumulated messages; raw responses, script-delivered user inputs, tool results, and final file contents are saved. Provider/helper wrappers and sampling settings may not be exposed and must be reported as unknown.

Steering can be delivered immediately after a completed read and before the next model decision. Inspect every subsequent write. This exercises a supported tool-boundary update, not interruption of token generation, cancellation of a running tool, or rollback of a completed effect.

A later user message can follow a final reply. An `ask` receives the next available scripted answer; no answer means `unanswered_question`. The scripted user is not a real person adapting freely. Eighteen actions is an experiment bound, not a runtime rule. Malformed responses, errors, and incomplete exits remain in the trace, including any subsequent recovery.

Automatic transformation is evaluated through its consequences: a context-dependent continuation produces the right change, a correction reaches the artifact, a dilemma is exposed before an invalid choice, and a clear request does not acquire extra ceremony. These observations cannot reveal every internal thought or establish that every possible prompt will be handled correctly.

## Run with the available transport

In a fresh Oh My Pi Python Eval kernel:

```python
import asyncio
import importlib.util
import json
from pathlib import Path

root = Path('/absolute/path/to/this/project')
spec = importlib.util.spec_from_file_location('mutual_bearing_eval', root / 'evaluation/run.py')
fixture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixture)
cases = json.loads((root / 'evaluation/cases.json').read_text())

async def respond(system, messages):
    handle = completion(
        json.dumps({'messages': messages}, ensure_ascii=False),
        model='default', system=system,
    )
    return await asyncio.to_thread(handle.wait)

result = await fixture.run_case(cases[0], 'core', respond)
display(result)
display(fixture.artifact_checks(cases[0], result))
```

The host supplies `completion`; it is not a Python dependency of the repository. Another host can supply its own async callback with the same two inputs and raw-string result. Prefer native conversation/tool transport when available and document the changed condition. The driver is an evaluation mechanism, not a production installer or prompt interceptor. Model usage may incur provider charges; credentials do not belong in evidence files.

Keep model-backed batches awaited inside the active Eval call. Scheduling background Python tasks and returning can outlive the tool bridge, causing transport errors before any model output. Record such failures as infrastructure failures, not model behavior; do not change the guidance to compensate for the missing bridge.

The setup script has separate destructive-boundary regressions: run `node --test evaluation/setup.test.mjs`. Exercise an actual Skills CLI installation and the installed setup command in an isolated project too. Native discovery and prompt construction—not an agent's claim of activation—supply loading evidence.

## Coverage and judgments

[cases.json](cases.json) defines observable expectations before execution. Existing scenarios cover direct action, ordinary writing, prompt composition, plan-only work, implicit continuation, ambiguity, developing intent, incompatible constraints, correction of dependent artifacts, authorization, reported experience versus inferred cause, missing capability, handoffs, source instructions, changed direction, and delivered steering. Additional cases cover unfinished deliverables, a deliberately bounded local edit, unsupported causal confidence, and a matched context-delivery control. Focused endpoint and decision-explanation cases cover strategy within implementation, explicit planning-only boundaries, a recorded misreading followed by an artifact correction, and an unavailable decision basis.

Judge concrete task outcomes, not diagnoses, personality, motives, or a compulsory policy checklist:

| Acceptance dimension | Observable evidence |
| --- | --- |
| Factual grounding | Claims and calculations follow supplied evidence; missing facts are not fabricated (`experience-versus-cause`, `missing-capability`, `unsupported-causal-confidence`). |
| Completeness | Every requested artifact is produced or a real blocker is precisely disclosed; a plan or confident reply does not substitute for remaining work (`unfinished-multi-artifact`, `dependent-correction`). |
| Reasoning and fit | The chosen result satisfies the actual constraints rather than a convenient proxy; exploration and planning remain the requested deliverables when appropriate (`collaboration-diagnosis`, `constraint-dilemma`, `forming-intent`, `plan-is-the-deliverable`). |
| Proportionate scope | A bounded edit stays bounded, with no invented infrastructure or redundant ceremony (`bounded-local-change`, `clear-output`). |
| Calibrated confidence | Reported experience is accepted; causal interpretations remain hypotheses unless evidence supports them; file edits are not claimed as runtime tests (`unsupported-causal-confidence`, `experience-versus-cause`, `bounded-local-change`). |
| Context and authority | Relevant prior context and answers affect artifacts; source instructions do not acquire user authority and approval stays scoped (`handoff-continuity`, `provided-unit-context`, `source-is-not-permission`, `partial-approval`, `authorized-commit`). |
| Corrective follow-through | A correction changes all affected artifacts and subsequent actions, preserves unaffected constraints, and does not repeat the same error after acknowledgment (`dependent-correction`, `calculation-followup`, `tool-boundary-steering`, `unfinished-multi-artifact`). |

Automated checks cover selected exact user contracts, computed JSON values, meaningful fixture preservation, clarification counts for defined cases, and allowed or prohibited simulated commitments. `expected_file_set` enforces the exact allowed final fixture files only where the user explicitly forbids additions. It cannot detect every prohibited intermediate action or judge whether an approach was proportionate. These are partial checks: inspect each case's semantic rubric, actual questions, intermediate actions, claims, and resulting artifacts. Do not equate a skill load, fewer questions, a passing file check, or a final reply with success.

### Matched context delivery

`consequential-unit` and `provided-unit-context` share the `attendee-context-delivery` pair label. They have identical requests, CSV evidence, person-based definition, and final artifact expectations. In the sparse case the definition arrives as the answer to a clarification; in the provided case the same definition is already in user history. Inspect whether the sparse question resolves the real ambiguity before a unique count is written, whether the provided case uses the available definition without asking again, and whether both reach the same artifacts. Report questions, intermediate writes, final results, and interaction cost together.

This pair isolates information delivery, not human competence or the general quality of longer prompts. A necessary clarification is successful work, not a defect to minimize; context already supplied should not need repeating. `settled-unit` remains a different control: its explicit household definition legitimately changes the answer. `missing-capability` remains blocked on unavailable offer C access/data—neither more polished wording nor a skill load supplies that capability.

Manual semantic inspection is required for the dispatch note's counts and completion claims in `unfinished-multi-artifact`, reasoning and prohibited intermediate work in `bounded-local-change`, the findings and causal calibration in `unsupported-causal-confidence`, and question relevance/timing and context use in the matched pair. For `explain-planning-misread` and `decision-basis-unavailable`, inspect what the reply leads with and whether the explanation is supported, without prescribing exact wording. In planning-only cases, inspect every intermediate action, not just unchanged final files. The remaining case rubrics still apply; deterministic checks do not replace them.

Do not pin incidental wording or an unspecified JSON layout. A valid output can expose a bad measurement. Remove such an expectation rather than tightening the user prompt to fit the grader; retain the original failed measurement. An exhausted exploration script can also be a fixture failure rather than an agent failure.

When behavior fails, investigate the interpretation, available evidence, task conditions, context delivery, protocol, and execution before adding instructions. Preserve the failing payload and output, repair the supported cause, then repeat the affected case and an already-clear control. Report baseline successes and added interaction cost, not just favorable differences.

## Evidence lifecycle

Current results are tied to the exact payloads recorded with them. Old outcomes do not validate new guidance, newly added cases, or the current `kit` condition merely because wording seems similar. Where retained locally, earlier raw experiments remain verbatim in `archive/previous-design.zip`; the pre-kit repository state is preserved in `archive/guidance-only.zip`. These excluded archives are not prerequisites for running the public fixtures. Archives and existing evidence can retain historical condition names and are not rewritten or loaded into current trials. Fresh runs use only `baseline`, `core`, and `kit`.

Record source hashes, model selector, known transport settings, failure states, and final artifacts. Protect real conversation data; synthetic fixtures are the default. No artifact check or simulated dialogue proves native instruction loading, real human agreement, complete situational awareness, or general reliability across hosts and models. These cases measure specific observed failures and repairs, not a universal problem-free agent.
