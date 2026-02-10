import { createRequire } from 'node:module';
import {
  type EnvironmentConfig,
  type RsbuildPlugin,
  type Rspack,
  rspack,
} from '@rsbuild/core';
import { JS_EXTENSIONS_PATTERN } from '../constant';

const require = createRequire(import.meta.url);

const PLUGIN_NAME = 'rsbuild:lib-entry-chunk';
const LOADER_NAME = 'rsbuild:lib-entry-module';
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

const entryModuleLoaderRsbuildPlugin = (): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      config.module
        .rule(`Rslib:${CHAIN_ID.RULE.JS}-entry-loader`)
        .test(config.module.rule(CHAIN_ID.RULE.JS).get('test'))
        .issuer(/^$/)
        .use(LOADER_NAME)
        .loader(require.resolve('./entryModuleLoader.js'));
    });
  },
});

export const composeEntryChunkConfig = ({
  enabledImportMetaUrlShim,
  useLoader,
  contextToWatch = null,
}: {
  useLoader: boolean;
  enabledImportMetaUrlShim: boolean;
  contextToWatch: string | null;
}): EnvironmentConfig => {
  return {
    plugins: useLoader ? [entryModuleLoaderRsbuildPlugin()] : [],
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
