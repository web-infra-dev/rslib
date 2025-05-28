import { type RsbuildPlugin, rspack } from '@rsbuild/core';

// This Rsbuild plugin will shim `import.meta.url` for CommonJS modules.
// - Replace `import.meta.url` with `importMetaUrl`.
// - Inject `importMetaUrl` to the end of the module (can't inject at the beginning because of `"use strict";`).
// This is a short-term solution, and we hope to provide built-in polyfills like `node.__filename` on Rspack side.
export const pluginCjsImportMetaUrlShim = (): RsbuildPlugin => ({
  name: 'rsbuild:cjs-import-meta-url-shim',
  setup(api) {
    api.modifyEnvironmentConfig((config) => {
      config.source.define = {
        ...config.source.define,
        'import.meta.url': '__rslib_import_meta_url__',
      };
    });
  },
});

const requireShim = `// Rslib ESM shims
import __rslib_shim_module__ from 'module';
const require = /*#__PURE__*/ __rslib_shim_module__.createRequire(import.meta.url);
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
