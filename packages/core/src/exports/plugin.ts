import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import { isJavaScriptOutputFile } from '../exe/utils';
import type { PkgJson, RequireKey, RsbuildConfigWithLibInfo } from '../types';
import { logger } from '../utils/logger';
import { normalizeSlash } from '../utils/helper';
import { findDeclarationFile } from './dts';
import { generateExports, type CollectedEntry } from './generate';
import {
  findStaleSubpaths,
  mergeExports,
  stringifyPackageJson,
} from './packageJson';

export type ExportsPluginOptions = {
  root: string;
  libInfos: RequireKey<RsbuildConfigWithLibInfo, 'id'>[];
};

export const ExportsPlugin = ({
  root,
  libInfos,
}: ExportsPluginOptions): RsbuildPlugin => {
  return {
    name: 'rslib:exports',
    setup(api) {
      api.onAfterBuild(({ stats }) => {
        // Failed builds already exit with errors, so there is nothing to export.
        if (!stats || stats.hasErrors()) return;

        const statsList = 'stats' in stats ? stats.stats : [stats];
        const collected = new Map<string, CollectedEntry[]>();
        const outputPaths: string[] = [];

        for (const { compilation } of statsList) {
          // Rsbuild names each compiler after its environment, which is the lib ID.
          const libId = compilation.name!;
          const outputPath = compilation.outputOptions.path!;
          outputPaths.push(outputPath);
          const emitsDeclarations = Boolean(
            libInfos.find(({ id }) => id === libId)?.dts,
          );

          const entries: CollectedEntry[] = [];
          for (const [entryName, entrypoint] of compilation.entrypoints) {
            // An entry chunk emits at most one JavaScript file. Entries without one,
            // such as global CSS entries in bundleless mode, are not exported.
            const entryFile = [...entrypoint.getEntrypointChunk().files].find(
              isJavaScriptOutputFile,
            );
            if (!entryFile) continue;
            const jsFile = normalizeSlash(
              path.relative(root, path.join(outputPath, entryFile)),
            );
            entries.push({
              entryName,
              jsFile,
              declaration: emitsDeclarations
                ? findDeclarationFile(jsFile, root)
                : undefined,
            });
          }
          collected.set(libId, entries);
        }

        const pkgJsonPath = path.join(root, 'package.json');
        const originalText = fs.readFileSync(pkgJsonPath, 'utf8');
        const pkgJson: PkgJson = JSON.parse(originalText);

        const generated = generateExports({ libInfos, collected });

        const exportsField = mergeExports(pkgJson.exports, generated);

        // Warn about subpaths that are likely left over instead of removing them.
        const staleSubpaths = findStaleSubpaths({
          existing: pkgJson.exports,
          generated,
          root,
          outputPaths,
        });
        if (staleSubpaths.length > 0) {
          logger.warn(
            `The following subpaths in the "exports" field of package.json point to files that do not exist in the output directories: ${staleSubpaths.map((key) => `"${key}"`).join(', ')}.`,
          );
        }

        const text = stringifyPackageJson(
          { ...pkgJson, exports: exportsField },
          originalText,
        );
        if (text === originalText) return;

        fs.writeFileSync(pkgJsonPath, text);
        logger.info('generated "exports" field in package.json.');
      });
    },
  };
};
