import { type EnvironmentConfig, type Rspack, rspack } from '@rsbuild/core';
import { JS_EXTENSIONS_PATTERN } from '../constant';
import type { DeepRequired, Format, Shims } from '../types';

const PLUGIN_NAME = 'rsbuild:lib-chunk-asset';
const IMPORT_META_URL_SHIM = `const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
`;

const REQUIRE_SHIM = `// Rslib ESM shims
import __rslib_shim_module__ from "node:module";
const require = /*#__PURE__*/ __rslib_shim_module__.createRequire(/*#__PURE__*/ (() => import.meta.url)());
`;

type ShimType = 'import.meta.url' | 'require';

const SHIMS: Record<ShimType, string> = {
  'import.meta.url': IMPORT_META_URL_SHIM,
  require: REQUIRE_SHIM,
};

// Matches a leading shebang and directives like `"use strict";` and
// `"use client"`, which must stay above the shim to take effect.
const PROLOGUE_REGEX = /^(?:#!.*\n)?(?:(["'])use [^"'\n]+\1(?:;\n?|\n))*/;

class ChunkAssetPlugin {
  private readonly shims: ShimType | undefined;
  private readonly contextToWatch: string | null = null;

  constructor({
    shims,
    contextToWatch,
  }: {
    shims?: ShimType;
    contextToWatch: string | null;
  }) {
    this.shims = shims;
    this.contextToWatch = contextToWatch;
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
      if (this.contextToWatch === null) {
        return;
      }

      const contextDep = compilation.contextDependencies;
      if (!contextDep.has(this.contextToWatch)) {
        contextDep.add(this.contextToWatch);
      }
    });

    if (!this.shims) return;
    const shimCode = SHIMS[this.shims];

    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      const jsChunkAssetNames = new Set<string>();

      compilation.hooks.chunkAsset.tap(PLUGIN_NAME, (_chunk, filename) => {
        const isJs = JS_EXTENSIONS_PATTERN.test(filename);
        if (!isJs) return;

        jsChunkAssetNames.add(filename);
      });

      // The default stage runs before minification, which can remove unused shims.
      compilation.hooks.processAssets.tap(PLUGIN_NAME, (assets) => {
        const chunkAsset = Object.keys(assets).filter((name) => {
          return (
            JS_EXTENSIONS_PATTERN.test(name) && jsChunkAssetNames.has(name)
          );
        });

        for (const name of chunkAsset) {
          compilation.updateAsset(name, (old) => {
            const oldSource = old.source().toString();
            const replaceSource = new rspack.sources.ReplaceSource(old);
            const prologue = PROLOGUE_REGEX.exec(oldSource)![0];

            replaceSource.insert(prologue.length, shimCode);

            return replaceSource;
          });
        }
      });
    });
  }
}

export const composeChunkAssetConfig = ({
  format,
  enabledShims,
  contextToWatch = null,
}: {
  format: Format;
  enabledShims: DeepRequired<Shims>;
  contextToWatch: string | null;
}): EnvironmentConfig => {
  let shims: ShimType | undefined;
  if (format === 'cjs' && enabledShims.cjs['import.meta.url']) {
    shims = 'import.meta.url';
  } else if (format === 'esm' && enabledShims.esm.require) {
    shims = 'require';
  }

  return {
    tools: {
      rspack: {
        plugins: [
          new ChunkAssetPlugin({
            shims,
            contextToWatch,
          }),
        ],
      },
    },
  };
};
