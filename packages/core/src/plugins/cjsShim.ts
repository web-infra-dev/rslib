import { type RsbuildPlugin, rspack } from '@rsbuild/core';

const importMetaUrlShim = `var __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
`;

// This Rsbuild plugin will shim `import.meta.url` for CommonJS modules.
// - Replace `import.meta.url` with `importMetaUrl`.
// - Inject `importMetaUrl` to the end of the module (can't inject at the beginning because of `"use strict";`).
// This is a short-term solution, and we hope to provide built-in polyfills like `node.__filename` on Rspack side.
export const pluginCjsShim = (): RsbuildPlugin => ({
  name: 'rsbuild-plugin-cjs-shim',

  setup(api) {
    api.modifyRsbuildConfig((config) => {
      config.source ||= {};
      config.source.define = {
        ...config.source.define,
        'import.meta.url': '__rslib_import_meta_url__',
      };
    });

    api.modifyRspackConfig((config) => {
      config.plugins ??= [];
      config.plugins.push(
        new rspack.BannerPlugin({
          banner: importMetaUrlShim,
          // Just before minify stage, to perform tree shaking.
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE - 1,
          raw: true,
          footer: true,
          include: /\.(js|cjs)$/,
        }),
      );
    });
  },
});
