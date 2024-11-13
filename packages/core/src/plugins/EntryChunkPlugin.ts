import { chmodSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import {
  type RsbuildConfig,
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
import { importMetaUrlShim } from './shims';
const require = createRequire(import.meta.url);

const PLUGIN_NAME = 'rsbuild:lib-entry-chunk';
const LOADER_NAME = 'rsbuild:lib-entry-module';

const matchFirstLine = (source: string, regex: RegExp) => {
  const [firstLine] = source.split(os.EOL);
  if (!firstLine) {
    return false;
  }
  const matched = regex.exec(firstLine);
  if (!matched) {
    return false;
  }

  return matched[0];
};

class EntryChunkPlugin {
  private reactDirectives: Record<string, string> = {};

  private shebangChmod = 0o755;
  private shebangEntries: Record<string, string> = {};
  private shebangInjectedAssets: Set<string> = new Set();

  private enabledImportMetaUrlShim: boolean;

  constructor({
    enabledImportMetaUrlShim = true,
  }: {
    enabledImportMetaUrlShim: boolean;
  }) {
    this.enabledImportMetaUrlShim = enabledImportMetaUrlShim;
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.entryOption.tap(PLUGIN_NAME, (_context, entries) => {
      for (const name in entries) {
        const entry = (entries as Rspack.EntryStaticNormalized)[name];
        if (!entry) continue;

        let first: string | undefined;
        if (Array.isArray(entry)) {
          first = entry[0];
        } else if (Array.isArray(entry.import)) {
          first = entry.import[0];
        } else if (typeof entry === 'string') {
          first = entry;
        }

        if (typeof first !== 'string') continue;

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

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkAsset.tap(PLUGIN_NAME, (chunk, filename) => {
        const isJs = JS_EXTENSIONS_PATTERN.test(filename);
        if (!isJs) return;

        const name = chunk.name;
        if (!name) return;

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

        const chunkAsset = Object.keys(assets);
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
                `"use strict";${os.EOL}${importMetaUrlShim}`,
              );
            } else {
              replaceSource.insert(0, importMetaUrlShim);
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
                  replaceSource.insert(0, `${shebangValue}${os.EOL}`);
                  this.shebangInjectedAssets.add(name);
                }

                // React directives
                if (reactDirectiveValue) {
                  replaceSource.insert(0, `${reactDirectiveValue}${os.EOL}`);
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
        .rule(CHAIN_ID.RULE.JS)
        .use(LOADER_NAME)
        .loader(require.resolve('./entryModuleLoader.js'));
    });
  },
});

export const composeEntryChunkConfig = ({
  enabledImportMetaUrlShim,
}: {
  enabledImportMetaUrlShim: boolean;
}): RsbuildConfig => {
  return {
    plugins: [entryModuleLoaderRsbuildPlugin()],
    tools: {
      rspack: {
        plugins: [
          new EntryChunkPlugin({
            enabledImportMetaUrlShim,
          }),
        ],
      },
    },
  };
};
