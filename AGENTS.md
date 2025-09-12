# Repository guidelines

## Project structure & module organization

- Monorepo via `pnpm` + `Nx`.
- Packages: `packages/core` (CLI + `@rslib/core`), `packages/plugin-dts` (DTS plugin), `packages/create-rslib` (scaffolder).
- Tests: `packages/*/tests` (unit) and `tests/` (`integration`, `e2e`, `benchmark`); examples in `examples/`.
- Key config: `nx.json`, `biome.json`, `.prettierrc.json`, `rslint.jsonc`, `pnpm-workspace.yaml`.

## Build, test, and development commands

- Install: `pnpm install` (Node >= 18.12, pnpm >= 10.15).
- Build: `pnpm build` (all) and `pnpm build:examples`.
- Watch dev: `pnpm -C packages/core dev` (or other package).
- Lint/format: `pnpm lint`; auto-fix: `pnpm format`.
- Type-check: `pnpm type-check`.
- Tests: `pnpm test`; targeted: `test:unit|:integration|:e2e|:benchmark`; update snapshots: `pnpm testu`.

## Coding style & naming conventions

- TypeScript + ESM; spaces; single quotes.
- Biome is canonical linter/formatter; Prettier formats MD/CSS/JSON and `package.json`.
- Filenames: `camelCase` or `PascalCase` (Biome enforced).

## Testing guidelines

- Unit/integration: `@rstest/core`; E2E: `@playwright/test`.
- Naming: `*.test.ts`/`*.test.tsx`; snapshots in `__snapshots__/`.
- Placement: unit under `packages/*/tests`; integration under `tests/integration`; e2e under `tests/e2e`.

## Commit & pull request guidelines

- Conventional Commits (e.g., `fix(dts): ...`); keep commits focused; run lint + tests.
- User-facing changes need a Changeset (`pnpm changeset`); PRs should include description, linked issues, and doc/example updates when needed.

## Architecture overview

- `packages/core` (`@rslib/core`): CLI `rslib build` (add `--watch`), config via `rslib.config.ts` using `defineConfig`; programmatic `import { build, defineConfig, loadConfig } from '@rslib/core'`.
- `packages/plugin-dts` (`rsbuild-plugin-dts`): detail implementation of `dts` in `rslib.config.ts` (e.g., `{ dts: { bundle: true } }`);
- `packages/create-rslib` (`create-rslib`): scaffold new projects/templates with `pnpm dlx create-rslib` (or `npx create-rslib`).

## Security & configuration tips

- Do not commit build artifacts (`dist/`, `compiled/`).
- Nx caching is enabled; scripts use `NX_DAEMON=false` for reproducible CI.
