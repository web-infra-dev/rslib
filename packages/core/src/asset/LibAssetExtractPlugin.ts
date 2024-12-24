import { type Rspack, rspack } from '@rsbuild/core';
import { getUndoPath } from '../css/utils';

type Options = {
}
/**
 * these codes is written according to
 * https://github.com/web-infra-dev/rspack/blob/61f0cd2b4e313445a9d3329ca71240e99edfb352/crates/rspack_plugin_asset/src/lib.rs#L531
 */
const pattern: RegExp = /__webpack_require__\.p\s\+\s["'](.+)["']/g;
function extractAssetFilenames (content: string): string[] {
  console.log([...content.matchAll(pattern)])
  return [...content.matchAll(pattern)].map(i => {
    return i?.[1]
  }).filter(Boolean) as string[];
}

const RSLIB_NAMESPACE_OBJECT = `__rslib_asset__`;

const esmSingleFileTemplate = (url: string) => `import ${RSLIB_NAMESPACE_OBJECT} from '${url}';
export default ${RSLIB_NAMESPACE_OBJECT};`;

const cjsSingleFileTemplate = (url: string) => `module.exports = require('${url}');`;

const pluginName = 'LIB_ASSET_EXTRACT_PLUGIN';

class LibAssetExtractPlugin implements Rspack.RspackPluginInstance {
  readonly name: string = pluginName;
  options: Options;
  constructor(options?: Options) {
    this.options = options ?? {};
  }

  apply(compiler: Rspack.Compiler): void {
    compiler.hooks.make.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tap(pluginName, (assets) => {
      const chunkAsset = Object.keys(assets).filter((name) =>
        /js/.test(name),
      );
      for (const name of chunkAsset) {
        const isEsmFormat = compilation.options.output.module;
        const undoPath = getUndoPath(
          name,
          compilation.outputOptions.path!,
          true,
        );
        compilation.updateAsset(name, (old) => {
          const oldSource = old.source().toString();
          const assetFilenames = extractAssetFilenames(oldSource);
          
          if (assetFilenames.length === 1) {
            const assetFilename = assetFilenames[0];
            let newSource: string = '';
            const url = `${undoPath}${assetFilename}`;
            
            if(isEsmFormat) {
              newSource = esmSingleFileTemplate(url);
            } else {
              newSource = cjsSingleFileTemplate(url);
            }
            return new rspack.sources.RawSource(newSource);
          } else {
            const newSource = new rspack.sources.ReplaceSource(old);
            assetFilenames.forEach(() => {
            })
            return newSource;
          } 
          
        });
      }
  })
})}
}
export { LibAssetExtractPlugin};
