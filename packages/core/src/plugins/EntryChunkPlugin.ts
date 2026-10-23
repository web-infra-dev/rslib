import { type EnvironmentConfig, type Rspack, rspack } from '@rsbuild/core';
import { JS_EXTENSIONS_PATTERN } from '../constant';

const PLUGIN_NAME = 'rsbuild:lib-entry-chunk';
const IMPORT_META_URL_SHIM = `const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
`;

// Matches a leading shebang and directives like `"use strict";` and
// `"use client"`, which must stay above the shim to take effect.
const PROLOGUE_REGEX = /^(?:#!.*\n)?(?:(["'])use [^"'\n]+\1(?:;\n?|\n))*/;

class EntryChunkPlugin {
  private readonly shimsInjectedAssets: Set<string> = new Set();

  private readonly enabledImportMetaUrlShim: boolean;
  private readonly contextToWatch: string | null = null;

  constructor({
    enabledImportMetaUrlShim = true,
    contextToWatch,
  }: {
    enabledImportMetaUrlShim: boolean;
    contextToWatch: string | null;
  }) {
    this.enabledImportMetaUrlShim = enabledImportMetaUrlShim;
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

    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkAsset.tap(PLUGIN_NAME, (_chunk, filename) => {
        const isJs = JS_EXTENSIONS_PATTERN.test(filename);
        if (!isJs) return;

        this.shimsInjectedAssets.add(filename);
      });
    });

    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(PLUGIN_NAME, (assets) => {
        if (!this.enabledImportMetaUrlShim) return;

        const chunkAsset = Object.keys(assets).filter((name) => {
          return (
            JS_EXTENSIONS_PATTERN.test(name) &&
            this.shimsInjectedAssets.has(name)
          );
        });

        for (const name of chunkAsset) {
          compilation.updateAsset(name, (old) => {
            const oldSource = old.source().toString();
            const replaceSource = new rspack.sources.ReplaceSource(old);
            const prologue = PROLOGUE_REGEX.exec(oldSource)![0];

            replaceSource.insert(prologue.length, IMPORT_META_URL_SHIM);

            return replaceSource;
          });
        }
      });
    });
  }
}

export const composeEntryChunkConfig = ({
  enabledImportMetaUrlShim,
  contextToWatch = null,
}: {
  enabledImportMetaUrlShim: boolean;
  contextToWatch: string | null;
}): EnvironmentConfig => {
  return {
    tools: {
      rspack: {
        plugins: [
          new EntryChunkPlugin({
            enabledImportMetaUrlShim,
            contextToWatch,
          }),
        ],
      },
    },
  };
};
