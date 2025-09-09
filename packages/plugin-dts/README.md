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
3. The [output.distPath.root](https://rsbuild.rs/config/output/dist-path) value of Rsbuild configuration.

```js
pluginDts({
  distPath: './dist-types',
});
```

### build

- **Type:** `boolean`
- **Default:** `false`

Whether to generate declaration files with building the project references. This is equivalent to using the `--build` flag with the `tsc` command. See [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) for more details.

In scenarios where project references are configured but the referenced project is not built independently (such as source code development), this option needs to be enabled to ensure that the declaration files of referenced projects can be generated correctly.

When this option is enabled, you must explicitly set `declarationDir` or `outDir` in `tsconfig.json` in order to meet the build requirements.

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

`alias` will be merged with `compilerOptions.paths` configured in `tsconfig.json` and `alias` has a higher priority.

In most cases, you don't need to use `alias`, but consider using it when you need to use path alias only in declaration files without wanting to affect JavaScript outputs. For example, map the declaration file of `foo` to `./compiled/foo`.

```js
pluginDts({
  alias: {
    foo: './compiled/foo',
  },
});
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

Controls the redirect of the import paths of output TypeScript declaration files.

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

Whether to automatically redirect the file extension to import paths based on the TypeScript declaration output files.

- When set to `true`, the import paths in declaration files will be redirected to the corresponding JavaScript extension which can be resolved to corresponding declaration file. The extension of the declaration output file is related to the `dtsExtension` configuration.

```ts
// `dtsExtension` is set to `.d.mts`
import { foo } from './foo'; // source code of './src/bar.ts' ↓
import { foo } from './foo.mjs'; // expected output of './dist/bar.d.mts'

import { foo } from './foo.ts'; // source code of './src/bar.ts' ↓
import { foo } from './foo.mjs'; // expected output of './dist/bar.d.mts'
```

- When set to `false`, the file extension will remain unchanged from the original import path in the rewritten import path of the output file (regardless of whether it is specified or specified as any value).

### tsgo

- **Type:** `boolean`
- **Default:** `false`

Whether to generate declaration files with [tsgo](https://github.com/microsoft/typescript-go), which can provide faster generation of declaration files, especially for large projects.

> This feature is currently an **experimental feature**. Since tsgo is still in the **experimental stage**, there may be some bugs and unresolved issues or limitations. So, make sure to fully test it in your project before enabling this option.

To enable this option, you need to:

1. Install [@typescript/native-preview](https://www.npmjs.com/package/@typescript/native-preview) as a development dependency.

```bash
npm add @typescript/native-preview -D
```

> `@typescript/native-preview` requires Node.js 20.6.0 or higher.

2. Set `tsgo` to `true`.

```js
pluginDts({
  tsgo: true,
});
```

3. In order to ensure the consistency of local development, you need to install the corresponding [VS Code Preview Extension](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview) and add the following configuration in the VS Code settings:

```json
{
  "typescript.experimental.useTsgo": true
}
```

## Contributing

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

## License

[MIT licensed](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
