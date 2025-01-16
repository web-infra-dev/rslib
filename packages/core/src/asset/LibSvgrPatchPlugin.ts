import { type Rspack, rspack } from '@rsbuild/core';
import { getUndoPath } from '../css/utils';

const pluginName = 'LIB_SVGR_PATCH_PLUGIN';

export const PUBLIC_PATH_PLACEHOLDER = '__RSLIB_SVGR_AUTO_PUBLIC_PATH__';

export class LibSvgrPatchPlugin implements Rspack.RspackPluginInstance {
  readonly name: string = pluginName;
  apply(compiler: Rspack.Compiler): void {
    compiler.hooks.make.tap(this.name, (compilation) => {
      compilation.hooks.processAssets.tap(this.name, (assets) => {
        const isEsm = Boolean(compilation.options.output.module);
        const chunkAsset = Object.keys(assets).filter((name) =>
          /js$/.test(name),
        );
        for (const name of chunkAsset) {
          compilation.updateAsset(name, (old) => {
            const oldSource = old.source().toString();
            const newSource = new rspack.sources.ReplaceSource(old);

            const pattern = new RegExp(
              `\\(?['"]${PUBLIC_PATH_PLACEHOLDER}(.*)['"]\\)?`,
              'g',
            );

            const matches = [...oldSource.matchAll(pattern)];
            const len = matches.length;
            if (len === 0) {
              return old;
            }

            const undoPath = getUndoPath(
              name,
              compilation.outputOptions.path!,
              true,
            );
            for (let i = 0; i < len; i++) {
              const match = matches[i]!;
              const filename = match[1];
              const requirePath = `${undoPath}${filename}`;
              let replaced = '';
              if (isEsm) {
                replaced = `__rslib_svgr_url__${i}__`;
              } else {
                replaced = `require("${requirePath}")`;
              }
              newSource.replace(
                match.index,
                match.index + match[0].length - 1,
                replaced,
              );

              if (isEsm) {
                newSource.insert(
                  0,
                  `import __rslib_svgr_url__${i}__ from "${requirePath}";\n`,
                );
              }
            }

            return newSource;
          });
        }
      });
    });
  }
}
