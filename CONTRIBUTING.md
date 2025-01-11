# Rslib contributing guide

Thanks for that you are interested in contributing to Rslib. Before starting your contribution, please take a moment to read the following guidelines.

## Install Node.js

Use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) to run the command below. This will switch to the Node.js version specified in the project's `.nvmrc` file.

```bash
# with fnm
fnm use

# with nvm
nvm use
```

## Install dependencies

Enable [pnpm](https://pnpm.io/) with corepack:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

What this will do:

- Install all dependencies.
- Create symlinks between packages in the monorepo
- Run the prepare script to build all packages, powered by [nx](https://nx.dev/).

## Making changes and building

Once you have set up the local development environment in your forked repo, we can start development.

### Checkout a new branch

It is recommended to develop on a new branch, as it will make things easier later when you submit a pull request:

```sh
git checkout -b MY_BRANCH_NAME
```

### Build the package

Use [nx build](https://nx.dev/nx-api/nx/documents/run) to build the package you want to change:

```sh
npx nx build @rslib/core
```

Build all packages:

```sh
pnpm run build
```

You can also use the watch mode to automatically rebuild the package when you make changes:

```sh
npx nx build @rslib/core --watch
```

## Testing

### Add new tests

If you've fixed a bug or added code that should be tested, then add some tests.

You can add unit test cases in the `<PACKAGE_DIR>/tests` folder. The test runner is based on [Vitest](https://vitest.dev/).

### Run unit tests

Before submitting a pull request, it's important to make sure that the changes haven't introduced any regressions or bugs. You can run the unit tests for the project by executing the following command:

```sh
pnpm run test:unit
```

You can also run the unit tests of single package:

```sh
pnpm run test:unit packages/core
```

Update snapshots:

```sh
pnpm run test:unit -u
```

### Run integration tests

Rslib will also verify the correctness of generated artifacts. You can run the integration tests by executing the following command:

```sh
pnpm run test:integration
```

If you need to run a specified test, you can add keywords to filter:

```sh
# Only run test cases which contains `dts` keyword in file path
pnpm test:integration dts
# Only run test cases which contains `dts` keyword in test name
pnpm test:integration -t dts
```

## Linting

To help maintain consistency and readability of the codebase, we use [Biome](https://github.com/biomejs/biome) to lint the codes.

You can run the linters by executing the following command:

```sh
pnpm run lint
```

For VS Code users, you can install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) to see lints while typing.

## Releasing

Repository maintainers can publish a new version of changed packages to npm.

1. Run `pnpm generate-release-pr` to generate a release branch, the default bump type is `patch`, use `--type minor/major` to bump minor/major version.
2. Create a pull request, the title should be `Release: v1.2.0`, ensure the CI check passes.
3. Run the [release action](https://github.com/web-infra-dev/rslib/actions/workflows/release.yml) to publish packages to npm.
4. Merge the release pull request to `main`.
5. Generate the [release notes](https://github.com/web-infra-dev/rslib/releases) via GitHub, see [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
