import type { Compiler, RspackPluginInstance } from '@rspack/core';

const pluginName = 'REMOVE_CSS_EXTRACT_ASSET_PLUGIN';

type Options = {
  include: RegExp;
};
class RemoveCssExtractAssetPlugin implements RspackPluginInstance {
  readonly name: string = pluginName;
  options: Options;
  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const include = this.options.include;
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.chunkAsset.tap(pluginName, (_chunk, filename) => {
        const asset = compilation.getAsset(filename);
        if (!asset) {
          return;
        }
        const needRemove = Boolean(asset.name.match(include));
        if (needRemove) {
          compilation.deleteAsset(filename);
        }
      });
    });
  }
}
export { RemoveCssExtractAssetPlugin };
