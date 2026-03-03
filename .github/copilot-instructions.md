# Copilot Code Review Instructions

## Purpose

Use these instructions for pull request review in this repository.
Focus on recurring, reusable review logic that prevents regressions.

## Instruction Style

- Write short, imperative feedback.
- Explain the underlying rule, not a one-off line edit.
- Suggest an actionable fix when you flag an issue.

## General Review Rules

- Keep suggestions aligned with the stated user goal; do not optimize for a different objective.
- Require rationale for non-obvious design or behavior decisions.
- Prefer fixes with limited blast radius over broad changes that can affect unrelated behavior.

## Documentation Review Rules

Apply these rules when reviewing Markdown, MDX, comments, examples, and user-facing guides.

- Use standardized command components such as `<PackageManager>` instead of hardcoded npm/pnpm/yarn command variants.
- Link each mentioned config option or API to its canonical official documentation.
- Call out global side effects of configuration choices and propose safer scoped alternatives when relevant.
- Avoid misleading examples or outputs; add clarifying context when artifacts may look incorrect.
- Remove duplicated explanations and keep one authoritative location per concept.
- Prefer concise, copy-pasteable command examples when multiple dependencies or setup steps are required.
- Ensure every mentioned package, plugin, or tool has a direct authoritative reference link.
