import type { RsbuildPlugin } from '@rsbuild/core';

// This Rsbuild plugin will shim `import.meta.url` for CommonJS modules.
// - Replace `import.meta.url` with `importMetaUrl`.
// - ChunkAssetPlugin injects the shim after the shebang and directives.
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
