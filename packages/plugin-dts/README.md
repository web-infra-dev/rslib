<picture>
  <img alt="Rslib Banner" src="https://assets.rspack.dev/rslib/rslib-banner.png">
</picture>

# rsbuild-plugin-dts

An [Rsbuild plugin](https://www.npmjs.com/package/rsbuild-plugin-dts) to emit declaration files for TypeScript which is built-in in Rslib.

## Using in Rslib

Read [DTS](https://lib.rsbuild.dev/guide/advanced/dts) and [lib.dts](https://lib.rsbuild.dev/config/lib/dts) for more details.

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

Whether to bundle the DTS files.

If you want to [bundle DTS](https://lib.rsbuild.dev/guide/advanced/dts#bundle-dts) files, you should:

1. Install `@microsoft/api-extractor` as a development dependency, which is the underlying tool used for bundling DTS files.

```bash
npm add @microsoft/api-extractor -D
```

2. Set `bundle` to `true`.

```js
pluginDts({
  bundle: true,
});
```

### distPath

- **Type:** `string`

The output directory of DTS files. The default value follows the priority below:

1. The `distPath` value of the plugin options.
2. The `declarationDir` value in the `tsconfig.json` file.
3. The [output.distPath.root](https://rsbuild.dev/config/output/dist-path) value of Rsbuild configuration.

```js
pluginDts({
  distPath: './dist-types',
});
```

### build

- **Type:** `boolean`
- **Default:** `false`

Whether to generate DTS files with building the project references. This is equivalent to using the `--build` flag with the `tsc` command. See [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) for more details.

When this option is enabled, you must explicitly set `declarationDir` or `outDir` in `tsconfig.json` in order to meet the build requirements.

### abortOnError

- **Type:** `boolean`
- **Default:** `true`

Whether to abort the build process when an error occurs during DTS generation.

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

The extension of the DTS file.

```js
pluginDts({
  dtsExtension: '.d.mts',
});
```

### autoExternal

- **Type:** `boolean`
- **Default:** `true`

Whether to automatically externalize dependencies of different dependency types and do not bundle them into the DTS file.

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

Inject content into the top of each DTS file.

```js
pluginDts({
  banner: '/** @banner */',
});
```

### footer

- **Type:** `string`
- **Default:** `undefined`

Inject content into the bottom of each DTS file.

```js
pluginDts({
  footer: '/** @footer */',
});
```

## Contributing

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

## License

[MIT licensed](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
