import { type RsbuildMode, createRsbuild } from '@rsbuild/core';
import { type Command, program } from 'commander';
import { build } from '../build';
import {
  composeRsbuildEnvironments,
  loadConfig,
  pruneEnvironments,
} from '../config';
import { logger } from '../utils/logger';

export type CommonOptions = {
  config?: string;
  envMode?: string;
  lib?: string[];
};

export type BuildOptions = CommonOptions & {
  watch?: boolean;
};

export type InspectOptions = CommonOptions & {
  mode: RsbuildMode;
  output: string;
  verbose?: boolean;
};

const applyCommonOptions = (command: Command) => {
  command
    .option(
      '-c --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .option(
      '--env-mode <mode>',
      'specify the env mode to load the `.env.[mode]` file',
    );
};

const repeatableOption = (value: string, previous: string[]) => {
  return (previous ?? []).concat([value]);
};

export function runCli(): void {
  program.name('rslib').usage('<command> [options]').version(RSLIB_VERSION);

  const buildCommand = program.command('build');
  const inspectCommand = program.command('inspect');

  [buildCommand, inspectCommand].forEach(applyCommonOptions);

  buildCommand
    .option(
      '--lib <name>',
      'build the specified library (may be repeated)',
      repeatableOption,
    )
    .option('-w --watch', 'turn on watch mode, watch for changes and rebuild')
    .description('build the library for production')
    .action(async (options: BuildOptions) => {
      try {
        const rslibConfig = await loadConfig({
          path: options.config,
          envMode: options.envMode,
        });
        await build(rslibConfig, options);
      } catch (err) {
        logger.error('Failed to build.');
        logger.error(err);
        process.exit(1);
      }
    });

  inspectCommand
    .description('inspect the Rsbuild / Rspack configs of Rslib projects')
    .option(
      '--lib <name>',
      'inspect the specified library (may be repeated)',
      repeatableOption,
    )
    .option(
      '--output <output>',
      'specify inspect content output path',
      '.rsbuild',
    )
    .option('--verbose', 'show full function definitions in output')
    .action(async (options: InspectOptions) => {
      try {
        // TODO: inspect should output Rslib's config
        const rslibConfig = await loadConfig({
          path: options.config,
          envMode: options.envMode,
        });
        const environments = await composeRsbuildEnvironments(rslibConfig);
        const rsbuildInstance = await createRsbuild({
          rsbuildConfig: {
            environments: pruneEnvironments(environments, options.lib),
          },
        });
        await rsbuildInstance.inspectConfig({
          mode: options.mode,
          verbose: options.verbose,
          outputPath: options.output,
          writeToDisk: true,
        });
      } catch (err) {
        logger.error('Failed to inspect config.');
        logger.error(err);
        process.exit(1);
      }
    });

  program.parse();
}
