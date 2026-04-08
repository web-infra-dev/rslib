import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import { resolveTargetBinaries } from './download';
import { color } from '../utils/color';
import { logger } from '../utils/logger';
import { buildExecutable } from './build';
import type { ExePluginOptions } from './types';
import {
  ensureBinaryVersion,
  formatBinarySize,
  getTimeCost,
  resolveBuiltMainFile,
  resolveExecutableOutputPath,
} from './utils';

export const ExePlugin = ({
  targets,
  format,
  root,
}: ExePluginOptions): RsbuildPlugin => {
  return {
    name: 'rslib:exe',
    setup(api) {
      api.onAfterEnvironmentCompile(async ({ environment, stats }) => {
        if (!stats || stats.hasErrors()) {
          return;
        }

        const entryNames = Array.from(stats.compilation.entrypoints.keys());

        if (entryNames.length !== 1 || !entryNames[0]) {
          throw new Error(
            `"experiments.exe" currently supports a single entry per library, but "${environment.name}" has ${entryNames.length} entries. Split them into multiple "lib" items to generate multiple executables.`,
          );
        }

        logger.info('generate single executable application started...');

        const entryName = entryNames[0];
        const mainFile = resolveBuiltMainFile({
          environment,
          entryName,
          stats,
        });
        const resolvedTargets = await Promise.all(
          targets.map((target) => resolveTargetBinaries(target)),
        );

        await Promise.all(
          resolvedTargets.map(async (target) => {
            const start = Date.now();
            const executablePath = resolveExecutableOutputPath({
              environment,
              mainFile,
              target,
            });
            const relativeExecutablePath =
              path.relative(root, executablePath) || executablePath;

            if (target.customBinaryPath) {
              // Custom binaries are user-provided, so keep a final guard that
              // the SEA builder and executable template really share one version.
              await ensureBinaryVersion(
                target.executableBinaryPath,
                target.builderBinaryPath,
              );
            }

            await buildExecutable({
              builderBinaryPath: target.builderBinaryPath,
              executablePath,
              executableBinaryPath: target.executableBinaryPath,
              mainFile,
              format,
              root,
              seaOptions: target.seaOptions,
              targetPlatform: target.platform,
            });

            const { size } = await fs.promises.stat(executablePath);
            logger.info(
              `generated executable: ${color.cyan(relativeExecutablePath)} ${color.green(`(${formatBinarySize(size)})`)} in ${getTimeCost(start)} ${color.dim(`(${environment.name})`)}`,
            );
          }),
        );
      });
    },
  };
};
