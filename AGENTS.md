# Repository guidelines

## Setup environment

1. Install [fnm](https://github.com/Schniz/fnm) and run `fnm install`/`fnm use` to match the Node.js version in `.nvmrc` (`v24.5.0`).
2. Enable Corepack (`corepack enable`) and then activate pnpm via `corepack prepare` (the pnpm version is specified in `packageManager` field in `package.json`).
3. Clone the repository and install dependencies with `pnpm install` from the repository root.

## Project structure & module organization

- Monorepo via the `pnpm` workspace.
- `packages/core` (`@rslib/core`): CLI entry (`rslib build`, `--watch`) and programmatic helpers (`build`, `defineConfig`, `loadConfig`).
- `packages/plugin-dts` (`rsbuild-plugin-dts`): provides the `dts` configuration hook (e.g., `{ dts: { bundle: true } }`).
- `packages/create-rslib` (`create-rslib`): scaffolds new projects via `pnpm dlx create-rslib` or `npx create-rslib`.
- Tests live in `packages/*/tests` (unit) and `tests/` (`integration`, `e2e`, `benchmark`); examples in `examples/`.
- Key configuration files: `nx.json`, `biome.json`, `.prettierrc.json`, `rslint.jsonc`, `pnpm-workspace.yaml`.

## Build, test, and development commands

- Install: `pnpm install` (all packages will be built in postinstall).
- Build: `pnpm build` (all) and `pnpm build:examples`.
- Watch dev: `pnpm -C packages/core dev` (or other package).
- Lint/format: `pnpm lint`; auto-fix: `pnpm format`.
- Type-check: `pnpm type-check`.
- Tests:
  - `pnpm test` runs the entire suites.
  - `pnpm test:unit` scopes to unit tests.
  - `pnpm test:integration` scopes to integration tests; add `<pattern>` to match specific cases.
  - `pnpm test:e2e` runs end-to-end tests.

## Coding style & naming conventions

- TypeScript + ESM; spaces; single quotes.
- Biome is canonical linter/formatter; Prettier formats MD/CSS/JSON and `package.json`.
- Run `pnpm biome check --write --unsafe` on modified source files; when `package.json` changes, also run `prettier --write package.json`.
- Filenames: `camelCase` or `PascalCase` (Biome enforced).

## Testing guidelines

- Unit/integration: `@rstest/core`; E2E: `@playwright/test`.
- Naming: `*.test.ts`/`*.test.tsx`; snapshots in `__snapshots__/`.
- Placement: unit under `packages/*/tests`; integration under `tests/integration`; e2e under `tests/e2e`.
- Target specific integration cases: `pnpm test:integration <pattern>` (faster than the full suite).

## Commit & pull request guidelines

- Conventional Commits (e.g., `fix(dts): ...`); keep commits focused; run lint + tests.
- User-facing changes need a Changeset (`pnpm changeset`); PRs should include description, linked issues, and doc/example updates when needed.

## Security & configuration tips

- Do not commit build artifacts (`dist/`, `compiled/`).
- Nx caching is enabled; scripts use `NX_DAEMON=false` for reproducible CI.
