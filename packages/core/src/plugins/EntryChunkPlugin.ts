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

            // Rewrite the `import.meta.url` emitted by Rspack's
            // `new-url-relative` URL template (e.g. `new URL(..., import.meta.url)`).
            // `import.meta` is invalid in CommonJS output, and this occurrence is
            // injected during code generation so it bypasses the `source.define`
            // replacement in `pluginCjsShims`. Since that define has already
            // rewritten every `import.meta.url` from user source, any remaining
            // one here comes from the URL template and is safe to replace.
            const IMPORT_META_URL = 'import.meta.url';
            for (
              let index = oldSource.indexOf(IMPORT_META_URL);
              index !== -1;
              index = oldSource.indexOf(IMPORT_META_URL, index + 1)
            ) {
              replaceSource.replace(
                index,
                index + IMPORT_META_URL.length - 1,
                '__rslib_import_meta_url__',
              );
            }

            if (oldSource.startsWith('#!')) {
              const firstLineEnd = oldSource.indexOf('\n');
              replaceSource.insert(firstLineEnd + 1, IMPORT_META_URL_SHIM);
            } else if (
              oldSource.startsWith("'use strict'") ||
              oldSource.startsWith('"use strict"')
            ) {
              replaceSource.replace(
                0,
                11,
                `"use strict";\n${IMPORT_META_URL_SHIM}`,
              );
            } else {
              replaceSource.insert(0, IMPORT_META_URL_SHIM);
            }

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
