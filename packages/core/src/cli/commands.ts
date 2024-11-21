import type { RsbuildMode } from '@rsbuild/core';
import { type Command, program } from 'commander';
import { logger } from '../utils/logger';
import { build } from './build';
import { loadRslibConfig } from './init';
import { inspect } from './inspect';
import { startMFDevServer } from './mf';

export type CommonOptions = {
  root?: string;
  config?: string;
  envMode?: string;
  lib?: string[];
};

export type BuildOptions = CommonOptions & {
  watch?: boolean;
};

export type InspectOptions = CommonOptions & {
  mode?: RsbuildMode;
  output?: string;
  verbose?: boolean;
};

const applyCommonOptions = (command: Command) => {
  command
    .option(
      '-c --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .option(
      '-r --root <root>',
      'specify the project root directory, can be an absolute path or a path relative to cwd',
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
  const mfDevCommand = program.command('mf dev');

  [buildCommand, inspectCommand, mfDevCommand].forEach(applyCommonOptions);

  buildCommand
    .option(
      '--lib <id>',
      'build the specified library (may be repeated)',
      repeatableOption,
    )
    .option('-w --watch', 'turn on watch mode, watch for changes and rebuild')
    .description('build the library for production')
    .action(async (options: BuildOptions) => {
      try {
        const rslibConfig = await loadRslibConfig(options);
        await build(rslibConfig, {
          lib: options.lib,
          watch: options.watch,
        });
      } catch (err) {
        logger.error('Failed to build.');
        logger.error(err);
        process.exit(1);
      }
    });

  inspectCommand
    .description('inspect the Rsbuild / Rspack configs of Rslib projects')
    .option(
      '--lib <id>',
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
        const rslibConfig = await loadRslibConfig(options);
        await inspect(rslibConfig, {
          lib: options.lib,
          mode: options.mode,
          output: options.output,
          verbose: options.verbose,
        });
      } catch (err) {
        logger.error('Failed to inspect config.');
        logger.error(err);
        process.exit(1);
      }
    });

  mfDevCommand
    .description('start Rsbuild dev server of Module Federation format')
    .action(async (options: CommonOptions) => {
      try {
        const rslibConfig = await loadRslibConfig(options);
        // TODO: support lib option in mf dev server
        await startMFDevServer(rslibConfig);
      } catch (err) {
        logger.error('Failed to start mf dev.');
        logger.error(err);
        process.exit(1);
      }
    });
  program.parse();
}
