import { type Rspack, rspack } from '@rsbuild/core';
import {
  ABSOLUTE_PUBLIC_PATH,
  AUTO_PUBLIC_PATH,
  BASE_URI,
  SINGLE_DOT_PATH_SEGMENT,
} from './const';
import { getUndoPath } from './utils';

const pluginName = 'LIB_CSS_EXTRACT_PLUGIN';

type Options = Record<string, unknown>;

class LibCssExtractPlugin implements Rspack.RspackPluginInstance {
  readonly name: string = pluginName;
  options: Options;
  constructor(options?: Options) {
    this.options = options ?? {};
  }

  apply(compiler: Rspack.Compiler): void {
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
              while (start !== -1) {
                replaceSource.replace(
                  start,
                  start + searchValue.length - 1,
                  replaceValue,
                );
                start = oldSource.indexOf(searchValue, start + 1);
              }
            }

            replace(SINGLE_DOT_PATH_SEGMENT, '.');
            const undoPath = getUndoPath(
              name,
              compilation.outputOptions.path!,
              // preserve './' in css url
              // https://github.com/web-infra-dev/rspack/pull/8946
              true,
            );
            replace(`${ABSOLUTE_PUBLIC_PATH}${AUTO_PUBLIC_PATH}`, undoPath);
            replace(ABSOLUTE_PUBLIC_PATH, '');
            replace(`${BASE_URI}/`, '');

            return replaceSource;
          });
        }
      });
    });
  }
}
export { LibCssExtractPlugin };
