import type { RsbuildMode } from '@rsbuild/core';
import { type Command, program } from 'commander';
import { build } from '../build';
import { initRsbuild, loadConfig } from '../config';
import { logger } from '../utils/logger';

export type CommonOptions = {
  config?: string;
  envMode?: string;
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

export function runCli(): void {
  program.name('rslib').usage('<command> [options]').version(RSLIB_VERSION);

  const buildCommand = program.command('build');
  const inspectCommand = program.command('inspect');

  [buildCommand, inspectCommand].forEach(applyCommonOptions);

  buildCommand
    .option('-w --watch', 'turn on watch mode, watch for changes and rebuild')
    .description('build the library for production')
    .action(async (options: BuildOptions) => {
      try {
        const rslibConfig = await loadConfig(options.config, options.envMode);
        await build(rslibConfig, options);
      } catch (err) {
        logger.error('Failed to build.');
        logger.error(err);
        process.exit(1);
      }
    });

  inspectCommand
    .description('inspect the Rslib / Rsbuild / Rspack configs')
    .option('--env <env>', 'specify env mode', 'development')
    .option('--output <output>', 'specify inspect content output path', './')
    .option('--verbose', 'show full function definitions in output')
    .action(async (options: InspectOptions) => {
      try {
        // TODO: inspect should output Rslib's config
        const rslibConfig = await loadConfig(options.config, options.envMode);
        const rsbuildInstance = await initRsbuild(rslibConfig);
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
