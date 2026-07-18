<picture>
  <img alt="Rslib Banner" src="https://assets.rspack.rs/rslib/rslib-banner.png">
</picture>

# rsbuild-plugin-dts

An [Rsbuild plugin](https://www.npmjs.com/package/rsbuild-plugin-dts) to emit declaration files for TypeScript which is built-in in Rslib.

## Using in Rslib

Read [Declaration files](https://rslib.rs/guide/advanced/dts) and [lib.dts](https://rslib.rs/config/lib/dts) for more details.

## Using in Rsbuild

Install:

```bash
npm add rsbuild-plugin-dts -D
```

Add plugin to `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginDts } from 'rsbuild-plugin-dts';

export default {
  plugins: [pluginDts()],
};
```

## Options

### bundle

- **Type:** `boolean`
- **Default:** `false`

Whether to bundle the declaration files.

If you want to [bundle declaration files](https://rslib.rs/guide/advanced/dts#bundle-declaration-files) files, you should:

1. Install `@microsoft/api-extractor` as a development dependency, which is the underlying tool used for bundling declaration files.

```bash
npm add @microsoft/api-extractor -D
```

2. Set `bundle` to `true`.

```js
pluginDts({
  bundle: true,
});
```

#### bundle.bundledPackages

- **Type:** `string[]`

Specifies the dependencies whose declaration files should be bundled. This configuration is passed to the [bundledPackages](https://api-extractor.com/pages/configs/api-extractor_json/#bundledpackages) option of `@microsoft/api-extractor`.

By default, `rsbuild-plugin-dts` determines externalized dependencies based on the following configurations.

- [autoExternal](#autoexternal) configuration
- [output.externals](https://rsbuild.rs/config/output/externals) configuration

Direct dependencies (declared in `package.json`) that are not externalized will be automatically added to `bundledPackages`, and their declaration files will be bundled into the final output.

When the default behavior does not meet the requirements, you can explicitly specify the dependencies whose declaration files need to be bundled through `bundle.bundledPackages`. After setting this configuration, the above default behavior will be completely overwritten.

This is typically used for bundling transitive dependencies (dependencies of direct dependencies). For example, if the project directly depends on `foo`, and `foo` depends on `bar`, you can bundle both `foo` and `bar`'s declaration files as follows:

```js
pluginDts({
  bundle: {
    bundledPackages: ['foo', 'bar'],
  },
});
```

> `bundledPackages` can be specified with the [minimatch](https://www.npmjs.com/package/minimatch) syntax, but will only match the declared direct dependencies in `package.json`.

### distPath

- **Type:** `string`

The output directory of declaration files. The default value follows the priority below:

1. The `distPath` value of the plugin options.
2. The `declarationDir` value in the `tsconfig.json` file.
3. The [output.distPath](https://rsbuild.rs/config/output/dist-path) or [output.distPath.root](https://rsbuild.rs/config/output/dist-path) value of Rsbuild configuration.

```js
pluginDts({
  distPath: './dist-types',
});
```

### build

- **Type:** `boolean`
- **Default:** `false`

Whether to generate declaration files with building the project references. This is equivalent to using the `--build` flag with the `tsc` command. See [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) for more details.

When the project references are configured but the referenced project has not been built separately (for example, the source code of other projects is directly referenced in monorepo, but the corresponding declaration file is missing in the project), this option needs to be enabled to ensure that the declaration files of referenced projects can be generated correctly, thereby ensuring the integrity of the type system.

This option can only be used when [bundle](#bundle) is `false`. When this option is enabled, `declarationDir` or `outDir` needs to be explicitly set in `tsconfig.json` to meet build requirements.

### abortOnError

- **Type:** `boolean`
- **Default:** `true`

Whether to abort the build process when an error occurs during declaration files generation.

By default, type errors will cause the build to fail.

When `abortOnError` is set to `false`, the build will still succeed even if there are type issues in the code.

```js
pluginDts({
  abortOnError: false,
});
```

### dtsExtension

- **Type:** `string`
- **Default:** `'.d.ts'`

The extension of the declaration file.

```js
pluginDts({
  dtsExtension: '.d.mts',
});
```

> When [tsgo](#tsgo) is enabled, if the project also enables [build](#build) or emits declaration files with different extensions to the same directory, `dtsExtension` may not work correctly.

### alias

- **Type:** `Record<string, string>`
- **Default:** `{}`

Configure the path alias for declaration files.

The path aliases configured in `alias` should be resolved relative to the directory specified by `compilerOptions.baseUrl` in `tsconfig.json`. These aliases will be merged with `compilerOptions.paths`, and `alias` takes higher precedence.

In most cases, you don't need to use `alias`, but consider using it when you need to use path alias only in declaration files without wanting to affect JavaScript outputs. For example, map the declaration file of `foo` to `./compiled/foo`.

```js
pluginDts({
  alias: {
    foo: './compiled/foo',
  },
});
```

At this time, when [redirect.path](#redirectpath) is enabled, the import path of `foo` in the declaration file will be redirected to `./compiled/foo`.

```diff
- export * from 'foo';
+ export * from './compiled/foo';
```

### autoExternal

- **Type:** `boolean`
- **Default:** `true`

Whether to automatically externalize dependencies of different dependency types and do not bundle them into the declaration file.

The default value of `autoExternal` is `true`, which means the following dependency types will not be bundled:

- `dependencies`
- `optionalDependencies`
- `peerDependencies`

And the following dependency types will be bundled:

- `devDependencies`

```js
pluginDts({
  autoExternal: {
    dependencies: true,
    optionalDependencies: true,
    peerDependencies: true,
    devDependencies: false,
  },
});
```

### banner

- **Type:** `string`
- **Default:** `undefined`

Inject content into the top of each declaration file.

```js
pluginDts({
  banner: '/** @banner */',
});
```

### footer

- **Type:** `string`
- **Default:** `undefined`

Inject content into the bottom of each declaration file.

```js
pluginDts({
  footer: '/** @footer */',
});
```

### redirect

- **Type:**

```ts
type DtsRedirect = {
  path?: boolean;
  extension?: boolean;
};
```

- **Default:**

```ts
const defaultRedirect = {
  path: true,
  extension: false,
};
```

Controls the redirect of the import paths of TypeScript declaration output files.

```js
pluginDts({
  redirect: {
    path: true,
    extension: false,
  },
});
```

#### redirect.path

- **Type:** `boolean`
- **Default:** `true`

Whether to automatically redirect the import paths of TypeScript declaration output files.

- When set to `true`, Rslib will redirect the import path in the declaration output file to the corresponding relative path based on the [compilerOptions.paths](https://typescriptlang.org/tsconfig#paths) configured in `tsconfig.json`.

```ts
// `compilerOptions.paths` is set to `{ "@/*": ["src/*"] }`
import { foo } from '@/foo'; // source code of './src/bar.ts' ↓
import { foo } from './foo'; // expected output of './dist/bar.d.ts'

import { foo } from '@/foo'; // source code of './src/utils/index.ts' ↓
import { foo } from '../foo'; // expected output './dist/utils/index.d.ts'
```

- When set to `false`, the original import path will remain unchanged.

#### redirect.extension

- **Type:** `boolean`
- **Default:** `false`

Whether to automatically redirect the file extension of import paths based on the TypeScript declaration output files.

- When set to `true`, the file extension of the import path in the declaration file will be automatically completed or replaced with the corresponding JavaScript file extension that can be resolved to the corresponding declaration file. The extension of the declaration output file is related to the `dtsExtension` configuration.

```ts
// `dtsExtension` is set to `.d.mts`
import { foo } from './foo'; // source code of './src/bar.ts' ↓
import { foo } from './foo.mjs'; // expected output of './dist/bar.d.mts'

import { foo } from './foo.ts'; // source code of './src/bar.ts' ↓
import { foo } from './foo.mjs'; // expected output of './dist/bar.d.mts'
```

- When set to `false`, import paths will retain their original file extensions.

### typescriptPath

- **Type:** `string`
- **Default:** The resolved path of `typescript` from the project root

Specifies a custom absolute path to the TypeScript module entry.

If a project uses TypeScript 6 and you want to try TypeScript 7 for declaration generation, install both versions with [npm aliases](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0):

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

Then, configure the plugin to use TypeScript 7 through the `@typescript/native` alias:

```ts
import { fileURLToPath } from 'node:url';
import { pluginDts } from 'rsbuild-plugin-dts';

export default {
  plugins: [
    pluginDts({
      typescriptPath: fileURLToPath(import.meta.resolve('@typescript/native')),
    }),
  ],
};
```

### tsgo

- **Type:** `boolean`
- **Default:** `true` when TypeScript 7+ is detected, otherwise `false`

Whether to generate declaration files using [native TypeScript](https://github.com/microsoft/typescript-go).

When unset, Rslib enables this option automatically when TypeScript 7+ is detected.

```bash
npm add typescript@latest -D
```

To ensure consistency during local development, you need to install the corresponding [VS Code Preview Extension](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview) and add the following setting to VS Code:

```json
{
  "typescript.experimental.useTsgo": true
}
```

### isolated

- **Type:** `boolean`
- **Default:** `false`

Whether to generate declaration files with [isolatedDeclarations](https://www.typescriptlang.org/tsconfig/#isolatedDeclarations).

> This option was added in Rslib v0.22.0 and is currently still experimental.

When enabled, `rsbuild-plugin-dts` uses Rspack's built-in SWC fast_dts capability to generate declaration files directly during the build.

```js
pluginDts({
  isolated: true,
});
```

When enabling this option, we recommend also enabling `isolatedDeclarations` in `tsconfig.json` so TypeScript can surface code that does not satisfy the `isolatedDeclarations` constraints earlier.

```json
{
  "compilerOptions": {
    "isolatedDeclarations": true
  }
}
```

#### Use cases

By default, `rsbuild-plugin-dts` generates declaration files through the TypeScript Compiler API, and it can also generate declaration files by enabling [tsgo](#tsgo). Unlike these two approaches, `isolated` is the fastest option and is suitable for scenarios that prioritize build performance.

Since `isolated` does not perform type checking during declaration generation, it is usually used together with another independent, high-performance type checking workflow. For example, in a monorepo project, you can use this option together with [`rslint --type-check`](https://rslint.rs/guide/type-checking):

- Daily builds: use `isolated` to quickly output declaration files when building each package.
- Global checks: run `rslint --type-check` in CI or pre-commit hooks to perform unified type checking when needed.

This preserves full type checking while reducing the cost of repeatedly running TypeScript type analysis, loading TypeScript or `tsgo` related packages, and loading native bindings during each package build, making the overall build pipeline lighter.

#### Output scope

`isolated` generates declaration files based on the module dependency graph during the Rspack build. Only entry modules and modules referenced by entry modules will generate corresponding declaration files. If a file is not included in the build dependency graph, it will not automatically generate declaration files like TypeScript does. If you want declaration files to be generated for these files as well, add them to [source.entry](https://rslib.rs/config/rsbuild/source#sourceentry), or make sure they are referenced by an existing entry.

#### Usage constraints

- `isolated` is currently only available when `pluginDts` is used through Rslib, because it requires Rslib's built-in RslibPlugin.
- `isolated` cannot be enabled together with [typescriptPath](#typescriptpath).
- `isolated` cannot be enabled together with [tsgo](#tsgo).
- `isolated` cannot be enabled together with [build](#build).
- When `isolated` is enabled, [abortOnError](#abortonerror) cannot be set to `false`.

## Contributing

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

## License

[MIT licensed](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
