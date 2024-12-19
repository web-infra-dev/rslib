import { rspack, type Rspack } from '@rsbuild/core';
import { getUndoPath } from './utils';
import { ABSOLUTE_PUBLIC_PATH, SINGLE_DOT_PATH_SEGMENT, AUTO_PUBLIC_PATH } from './libCssExtractLoader';

const pluginName = 'LIB_CSS_EXTRACT_PLUGIN';

type Options = {
  include: RegExp;
};

class LibCssExtractPlugin implements Rspack.RspackPluginInstance {
  readonly name: string = pluginName;
  options: Options;
  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler: Rspack.Compiler): void {
    const include = this.options.include;
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.chunkAsset.tap(pluginName, (_chunk, filename) => {
        const asset = compilation.getAsset(filename);
        console.log(asset);
        if (!asset) {
          return;
        }
        const needRemove = Boolean(asset.name.match(include));
        if (needRemove) {
          compilation.deleteAsset(filename);
        }
      });
      
    });

    /**
     * The following code is modified based on
     * https://github.com/webpack-contrib/mini-css-extract-plugin/blob/3effaa0319bad5cc1bf0ae760553bf7abcbc35a4/src/index.js#L1597
     * 
     * replace publicPath placeholders of miniCssExtractLoader
     */
    compiler.hooks.make.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(pluginName, (assets) => {
        const chunkAsset = Object.keys(assets).filter((name) =>
          /\.css/.test(name),
        );
        for (const name of chunkAsset) {
          compilation.updateAsset(name, (old) => {
            const oldSource = old.source().toString();
            const replaceSource = new rspack.sources.ReplaceSource(old);

            function replace(searchValue: string, replaceValue: string) {
              let start = oldSource.indexOf(searchValue);
              while(start !== -1) {
                console.log(start)
                replaceSource.replace(
                  start,
                  start + searchValue.length - 1,
                  replaceValue,
                );
                start = oldSource.indexOf(searchValue, start + 1);
              }
            }

            replace(ABSOLUTE_PUBLIC_PATH, '');
            replace(SINGLE_DOT_PATH_SEGMENT, '.');
            const undoPath = getUndoPath(name, compilation.outputOptions.path!, false);
            replace(AUTO_PUBLIC_PATH, undoPath)

            return replaceSource;
          });
        }

      });
    });
  }
}
export { LibCssExtractPlugin };
