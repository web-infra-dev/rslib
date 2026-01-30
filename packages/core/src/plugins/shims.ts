import { type RsbuildPlugin, rspack } from '@rsbuild/core';

// This Rsbuild plugin will shim `import.meta.url` for CommonJS modules.
// - Replace `import.meta.url` with `importMetaUrl`.
// - Inject `importMetaUrl` to the end of the module (can't inject at the beginning because of `"use strict";`).
// This is a short-term solution, and we hope to provide built-in polyfills like `node.__filename` on Rspack side.
export const pluginCjsShims = (enabledShims: {
  'import.meta.url'?: boolean;
  'import.meta.dirname'?: boolean;
  'import.meta.filename'?: boolean;
}): RsbuildPlugin => ({
  name: 'rsbuild:cjs-shims',
  setup(api) {
    api.modifyEnvironmentConfig((config) => {
      config.source.define = {
        ...config.source.define,
        ...(enabledShims['import.meta.url'] && {
          'import.meta.url': '__rslib_import_meta_url__',
        }),
        ...(enabledShims['import.meta.dirname'] && {
          'import.meta.dirname': '__dirname',
        }),
        ...(enabledShims['import.meta.filename'] && {
          'import.meta.filename': '__filename',
        }),
      };
    });
  },
});

const requireShim = `// Rslib ESM shims
import __rslib_shim_module__ from "node:module";
const require = /*#__PURE__*/ __rslib_shim_module__.createRequire(/*#__PURE__*/ (() => import.meta.url)());
`;

export const pluginEsmRequireShim = (): RsbuildPlugin => ({
  name: 'rsbuild:esm-require-shim',
  setup(api) {
    api.modifyRspackConfig((config) => {
      config.plugins ??= [];
      config.plugins.push(
        new rspack.BannerPlugin({
          banner: requireShim,
          // Just before minify stage, to perform tree shaking.
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE - 1,
          raw: true,
          include: /\.(js|mjs)$/,
        }),
      );
    });
  },
});
