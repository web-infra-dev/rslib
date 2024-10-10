import type { RsbuildPlugin } from '@rsbuild/core';

const importMetaUrlShim = `/*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})()`;

// This Rsbuild plugin will shim `import.meta.url` for CommonJS modules.
// - Replace `import.meta.url` with `importMetaUrl`.
// - Inject `importMetaUrl` to the end of the module (can't inject at the beginning because of `"use strict";`).
// This is a short-term solution, and we hope to provide built-in polyfills like `node.__filename` on Rspack side.
export const pluginCjsShim = (): RsbuildPlugin => ({
  name: 'rsbuild-plugin-cjs-shim',

  setup(api) {
    api.modifyEnvironmentConfig((config) => {
      config.source.define = {
        ...config.source.define,
        'import.meta.url': importMetaUrlShim,
      };
    });
  },
});
