import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import { RSLIB_CSS_ENTRY_FLAG } from '../css/cssConfig';
import { isJavaScriptOutputFile } from '../exe/utils';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../types';
import { logger } from '../utils/logger';
import { normalizeSlash, readPackageJson } from '../utils/helper';
import { generateExports, type CollectedEntry } from './generate';

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
      api.onAfterBuild(({ environments, stats }) => {
        if (!stats) return;

        const statsList = 'stats' in stats ? stats.stats : [stats];
        // Environment names correspond to lib IDs, allowing entries to be matched with their output formats.
        const collected = new Map<string, CollectedEntry[]>();
        const failedEnvironments = new Set<string>();

        for (const environment of Object.values(environments)) {
          const environmentStats = statsList[environment.index];
          if (!environmentStats || environmentStats.hasErrors()) {
            failedEnvironments.add(environment.name);
            continue;
          }

          const entries: CollectedEntry[] = [];
          const outputPath =
            environmentStats.compilation.outputOptions.path ??
            environment.distPath;

          for (const [entryName, entrypoint] of environmentStats.compilation
            .entrypoints) {
            // Global CSS uses placeholder entries that should not be exposed by the package.
            if (entryName.startsWith(RSLIB_CSS_ENTRY_FLAG)) continue;
            const entryFile = [...entrypoint.getEntrypointChunk().files].find(
              isJavaScriptOutputFile,
            );
            if (!entryFile) continue;
            entries.push({
              entryName,
              jsFile: normalizeSlash(
                path.relative(root, path.join(outputPath, entryFile)),
              ),
            });
          }
          collected.set(environment.name, entries);
        }

        if (failedEnvironments.size > 0) {
          const failedEnvironmentNames = [...failedEnvironments]
            .map((name) => `"${name}"`)
            .join(', ');
          logger.warn(
            `Skip generating the "exports" field because the following environments failed to compile: ${failedEnvironmentNames}.`,
          );
          return;
        }

        const pkgJson = readPackageJson(root);
        if (!pkgJson) return;

        const exportsField = generateExports({ libInfos, collected });
        if (!exportsField) return;

        fs.writeFileSync(
          path.join(root, 'package.json'),
          `${JSON.stringify({ ...pkgJson, exports: exportsField }, null, 2)}\n`,
        );
        logger.info('generated "exports" field in package.json.');
      });
    },
  };
};
