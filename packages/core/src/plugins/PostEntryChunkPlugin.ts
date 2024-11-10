import { createRequire } from 'node:module';
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

const PLUGIN_NAME = 'rsbuild:entry';

const matchFirstLine = (source: string, regex: RegExp) => {
  const [firstLine] = source.split('\n');
  if (!firstLine) {
    return false;
  }
  const matched = regex.exec(firstLine);
  if (!matched) {
    return false;
  }

  return matched[0];
};

class PostEntryPlugin {
  private enabledImportMetaUrlShim: boolean;
  private shebangEntries: Record<string, string> = {};
  private reactDirectives: Record<string, string> = {};
  private importMetaUrlShims: Record<string, { startsWithUseStrict: boolean }> =
    {};

  constructor({
    importMetaUrlShim = true,
  }: {
    importMetaUrlShim: boolean;
  }) {
    this.enabledImportMetaUrlShim = importMetaUrlShim;
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

        // import.meta.url shim
        if (this.enabledImportMetaUrlShim) {
          this.importMetaUrlShims[name] = {
            startsWithUseStrict:
              // This is a hypothesis that no comments will occur before "use strict;".
              // But it should cover most cases.
              content.startsWith('use strict;') ||
              content.startsWith('"use strict";'),
          };
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

        const importMetaUrlShimInfo = this.importMetaUrlShims[name];
        if (importMetaUrlShimInfo) {
          this.importMetaUrlShims[filename] = importMetaUrlShimInfo;
        }
      });
    });

    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(PLUGIN_NAME, (assets) => {
        const chunkAsset = Object.keys(assets);
        for (const name of chunkAsset) {
          if (this.enabledImportMetaUrlShim) {
            compilation.updateAsset(name, (old) => {
              const importMetaUrlShimInfo = this.importMetaUrlShims[name];
              if (importMetaUrlShimInfo) {
                const replaceSource = new rspack.sources.ReplaceSource(old);

                if (importMetaUrlShimInfo.startsWithUseStrict) {
                  replaceSource.replace(
                    0,
                    11, // 'use strict;'.length,
                    `"use strict";\n${importMetaUrlShim}`,
                  );
                } else {
                  replaceSource.insert(0, importMetaUrlShim);
                }

                return replaceSource;
              }

              return old;
            });
          }
        }
      });

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          // Just after minify stage, to avoid from being minified.
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
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
  }
}

const entryModuleLoaderPlugin = (): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
    api.modifyBundlerChain((config, { CHAIN_ID }) => {
      const rule = config.module.rule(CHAIN_ID.RULE.JS);
      rule
        .use('shebang')
        .loader(require.resolve('./entryModuleLoader.js'))
        .options({});
    });
  },
});

export const composePostEntryChunkConfig = ({
  importMetaUrlShim,
}: {
  importMetaUrlShim: boolean;
}): RsbuildConfig => {
  return {
    plugins: [entryModuleLoaderPlugin()],
    tools: {
      rspack: {
        plugins: [
          new PostEntryPlugin({
            importMetaUrlShim: importMetaUrlShim,
          }),
        ],
      },
    },
  };
};
