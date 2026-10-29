import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin, Rspack } from '@rsbuild/core';
import { isCssFile } from '../css/utils';
import { isJavaScriptOutputFile } from '../exe/utils';
import type {
  ExportsField,
  ExportsOptions,
  ExportsCustomContext,
  PkgJson,
  RequireKey,
  RsbuildConfigWithLibInfo,
} from '../types';
import { logger } from '../utils/logger';
import { normalizeSlash } from '../utils/helper';
import { findDeclarationFile } from './dts';
import { type CollectedEntry, generateExports } from './generate';
import { stringifyPackageJson } from './packageJson';

export type ExportsPluginOptions = {
  root: string;
  libInfos: RequireKey<RsbuildConfigWithLibInfo, 'id'>[];
  options: ExportsOptions;
};

async function customizeExports(
  exports: ExportsField,
  { custom }: ExportsOptions,
  context: ExportsCustomContext,
): Promise<ExportsField> {
  if (typeof custom === 'function') {
    return custom(exports, context);
  }
  return { ...exports, ...custom };
}

export const ExportsPlugin = ({
  root,
  libInfos,
  options,
}: ExportsPluginOptions): RsbuildPlugin => {
  const toRelative = (file: string) =>
    normalizeSlash(path.relative(root, file));

  const collect = (compilation: Rspack.Compilation): CollectedEntry[] => {
    const libInfo = libInfos.find(({ id }) => id === compilation.name)!;
    const outputPath = compilation.outputOptions.path!;
    const { dts } = libInfo;
    const dtsDistPath =
      typeof dts === 'object' && dts.distPath
        ? path.resolve(root, dts.distPath)
        : undefined;

    const entries: CollectedEntry[] = [];
    for (const [entryName, entrypoint] of compilation.entrypoints) {
      const sourceFiles = compilation.entries
        .get(entryName)!
        .dependencies.flatMap((dependency) => {
          // The module of a dependency may be a concatenated module without a
          // resource, while the resolved module is the original one.
          const resource = (
            compilation.moduleGraph.getResolvedModule(dependency) as {
              resource?: string;
            } | null
          )?.resource;
          return resource ? [toRelative(resource.split('?')[0]!)] : [];
        });
      // The JavaScript output of an entry built only from CSS files is empty.
      const cssOnly = sourceFiles.length > 0 && sourceFiles.every(isCssFile);
      // An entry chunk emits at most one JavaScript file and one CSS file.
      // Reading them from the entry chunk skips the separate runtime chunk.
      const files = [...entrypoint.getEntrypointChunk().files];
      const jsOutput = cssOnly ? undefined : files.find(isJavaScriptOutputFile);
      // Bundleless outputs import their own styles, so CSS is only exported in
      // bundle mode.
      const cssOutput =
        libInfo.bundle === false ? undefined : files.find(isCssFile);

      const js = jsOutput
        ? {
            file: toRelative(path.join(outputPath, jsOutput)),
            name: normalizeSlash(jsOutput),
          }
        : undefined;
      entries.push({
        entryName,
        js,
        css: cssOutput
          ? {
              file: toRelative(path.join(outputPath, cssOutput)),
              name: normalizeSlash(cssOutput),
            }
          : undefined,
        declaration:
          js && dts
            ? findDeclarationFile({
                jsFile: js.file,
                root,
                outputPath,
                dtsDistPath,
              })
            : undefined,
        sourceFiles,
      });
    }
    return entries;
  };

  const writeExports = async (stats: Rspack.Stats | Rspack.MultiStats) => {
    const statsList = 'stats' in stats ? stats.stats : [stats];
    const collected = new Map<string, CollectedEntry[]>();
    for (const { compilation } of statsList) {
      // Rsbuild names each compiler after its environment, which is the lib ID.
      collected.set(compilation.name!, collect(compilation));
    }

    const { exports, publishExports } = generateExports({
      libInfos,
      collected,
      options,
    });

    const pkgJsonPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      throw new Error(
        `Failed to generate the "exports" field because "${pkgJsonPath}" does not exist.`,
      );
    }
    const originalText = fs.readFileSync(pkgJsonPath, 'utf8');
    // An invalid package.json already fails the build before this hook, as
    // Rsbuild parses it when loading the PostCSS config.
    const pkg: PkgJson = JSON.parse(originalText);

    const content: PkgJson = {
      ...pkg,
      exports: await customizeExports(exports, options, {
        pkg,
        isPublish: false,
      }),
    };
    if (publishExports) {
      content.publishConfig = {
        ...pkg.publishConfig,
        exports: await customizeExports(publishExports, options, {
          pkg,
          isPublish: true,
        }),
      };
    }

    const text = stringifyPackageJson(content, originalText);
    if (text === originalText) return;

    fs.writeFileSync(pkgJsonPath, text);
    logger.info('generated "exports" field in package.json.');
  };

  return {
    name: 'rslib:exports',
    setup(api) {
      api.onAfterBuild(async ({ stats }) => {
        // Failed builds already report errors, so there is nothing to export.
        if (!stats || stats.hasErrors()) return;
        await writeExports(stats);
      });
    },
  };
};
