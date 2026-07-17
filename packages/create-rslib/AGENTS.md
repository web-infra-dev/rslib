# Package guidelines — create-rslib

This guide extends the repository instructions in `../../AGENTS.md`. Refer there for workspace setup, tooling versions, and global workflows.

## Package overview

- `create-rslib` provides the `pnpm create rslib` scaffolding CLI shipped from `dist/`.
- Author source changes under `src/`; treat `dist/` as build output regenerated via `pnpm -C packages/create-rslib build`.
- Template inputs are the checked-in `template-*` directories. They are copied directly by `create-rstack` and published with this package.
- Tests in `test/` use `@rstest/core` to exercise CLI flows and validate generated projects.

## Common commands

- Build once before testing locally: `pnpm -C packages/create-rslib build`.
- Watch rebuild during development: `pnpm -C packages/create-rslib dev`.
- Run package tests: `pnpm -C packages/create-rslib test`; the repo-level `pnpm test:unit` also covers this package.

## Working on templates

- Add or update base template files in directories such as `template-react-ts/`, `template-vue-js/`, and shared files in `template-common/`.
- Add or update tool overlays in directories such as `template-storybook/`, `template-rspress/`, and `template-react-compiler/`; these overlays are merged into the selected base template by `src/index.ts`.
- Update `TEMPLATES` and `extraTools` in `src/index.ts` whenever you introduce a new template or tool combination so the CLI prompts and tests remain exhaustive.
- Keep dependency versions aligned across sibling template package files. For example, a Storybook dependency change should update every relevant `template-storybook/*/package.json` file together.
