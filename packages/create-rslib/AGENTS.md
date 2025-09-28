# Package guidelines — create-rslib

This guide extends the repository instructions in `../../AGENTS.md`. Refer there for workspace setup, tooling versions, and global workflows.

## Package overview

- `create-rslib` provides the `pnpm create rslib` scaffolding CLI shipped from `dist/`.
- Author source changes under `src/`; treat `dist/` as build output regenerated via `pnpm -C packages/create-rslib build`.
- Template inputs live in `fragments/`; generated scaffolding blueprints are the `template-*` directories.
- Tests in `test/` use `@rstest/core` to exercise CLI flows and validate generated projects.

## Common commands

- Build once before testing locally: `pnpm -C packages/create-rslib build`.
- Watch rebuild during development: `pnpm -C packages/create-rslib dev`.
- Regenerate template directories after touching fragments or generators: `pnpm -C packages/create-rslib generate-templates`.
- Run package tests: `pnpm -C packages/create-rslib test`; the repo-level `pnpm test:unit` also covers this package.

## Working on templates

- Add or update base files in `fragments/base/*` and tool overlays in `fragments/tools/*`; keep naming aligned with `src/helpers.ts`.
- Update `TEMPLATES` in `src/helpers.ts` whenever you introduce a new template combination so the CLI prompts and tests remain exhaustive.
- Treat `template-*` directories as generated output from `pnpm -C packages/create-rslib generate-templates`; keep changes reproducible by updating generators in `src/` or fragments under `fragments/` instead of editing the generated files directly.
- Keep dependency versions aligned across all `template-*` directories; when one template upgrades a shared dependency, update the others via fragments or generators to match.
