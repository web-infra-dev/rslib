import { chmodSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  type EnvironmentConfig,
  type RsbuildPlugin,
  type Rspack,
  rspack,
} from '@rsbuild/core';
import {
  JS_EXTENSIONS_PATTERN,
  REACT_DIRECTIVE_REGEX,
  SHEBANG_PREFIX,
  SHEBANG_REGEX,
} from '../constant';
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

const matchFirstLine = (source: string, regex: RegExp): string | false => {
  const lineBreakPos = source.match(/(\r\n|\n)/);
  const firstLineContent = source.slice(0, lineBreakPos?.index);
  const matched = regex.exec(firstLineContent);
  if (!matched) {
    return false;
  }

  return matched[0];
};

class EntryChunkPlugin {
  private reactDirectives: Record<string, string> = {};

  private shimsInjectedAssets: Set<string> = new Set();

  private shebangChmod = 0o755;
  private shebangEntries: Record<string, string> = {};
  private shebangInjectedAssets: Set<string> = new Set();

  private enabledImportMetaUrlShim: boolean;
  private contextToWatch: string | null = null;

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
      const entries: Record<string, string> = {};
      for (const [key, value] of compilation.entries) {
        const firstDep = value.dependencies[0];
        if (firstDep?.request) {
          entries[key] = firstDep.request;
        }
      }

      for (const name in entries) {
        const first = entries[name];
        if (!first) continue;
        const filename = first.split('?')[0]!;
        const isJs = JS_EXTENSIONS_PATTERN.test(filename);
        if (!isJs) continue;
        const content = compiler.inputFileSystem!.readFileSync!(filename, {
          encoding: 'utf-8',
        });
        // Shebang
        if (content.startsWith(SHEBANG_PREFIX)) {
          const shebangMatch = matchFirstLine(content, SHEBANG_REGEX);
          if (shebangMatch) {
            this.shebangEntries[name] = shebangMatch;
          }
        }
        // React directive
        const reactDirective = matchFirstLine(content, REACT_DIRECTIVE_REGEX);
        if (reactDirective) {
          this.reactDirectives[name] = reactDirective;
        }
      }
    });

    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkAsset.tap(PLUGIN_NAME, (chunk, filename) => {
        const isJs = JS_EXTENSIONS_PATTERN.test(filename);
        if (!isJs) return;

        const name = chunk.name;
        if (!name) return;

        this.shimsInjectedAssets.add(filename);

        const shebangEntry = this.shebangEntries[name];
        if (shebangEntry) {
          this.shebangEntries[filename] = shebangEntry;
        }

        const reactDirective = this.reactDirectives[name];
        if (reactDirective) {
          this.reactDirectives[filename] = reactDirective;
        }
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
            if (
              oldSource.startsWith('use strict;') ||
              oldSource.startsWith('"use strict";')
            ) {
              replaceSource.replace(
                0,
                11, // 'use strict;'.length,
                `"use strict";\n${IMPORT_META_URL_SHIM}`,
              );
            } else {
              replaceSource.insert(0, IMPORT_META_URL_SHIM);
            }

            return replaceSource;
          });
        }
      });

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          // Just after minify stage, to avoid from being minified.
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING - 1,
        },
        (assets) => {
          const chunkAsset = Object.keys(assets);
          for (const name of chunkAsset) {
            const shebangValue = this.shebangEntries[name];
            const reactDirectiveValue = this.reactDirectives[name];

            if (shebangValue || reactDirectiveValue) {
              compilation.updateAsset(name, (old) => {
                const replaceSource = new rspack.sources.ReplaceSource(old);
                // Shebang
                if (shebangValue) {
                  replaceSource.insert(0, `${shebangValue}\n`);
                  this.shebangInjectedAssets.add(name);
                }

                // React directives
                if (reactDirectiveValue) {
                  replaceSource.insert(0, `${reactDirectiveValue}\n`);
                }

                return replaceSource;
              });
            }
          }
        },
      );
    });

    compiler.hooks.assetEmitted.tap(PLUGIN_NAME, (file, { targetPath }) => {
      if (this.shebangInjectedAssets.has(file)) {
        chmodSync(targetPath, this.shebangChmod);
      }
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
  contextToWatch = null,
}: {
  enabledImportMetaUrlShim: boolean;
  contextToWatch: string | null;
}): EnvironmentConfig => {
  return {
    plugins: [entryModuleLoaderRsbuildPlugin()],
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
