import type { LogLevel, RsbuildMode } from '@rsbuild/core';
import cac, { type CAC } from 'cac';
import type { ConfigLoader } from '../config';
import type { Format, Syntax } from '../types/config';
import { logger } from '../utils/logger';
import { build } from './build';
import { initConfig } from './initConfig';
import { inspect } from './inspect';
import { startMFDevServer } from './mf';
import { watchFilesForRestart } from './restart';

export type CommonOptions = {
  root?: string;
  config?: string;
  envDir?: string;
  envMode?: string;
  lib?: string[];
  configLoader?: ConfigLoader;
  logLevel?: LogLevel;
};

export type BuildOptions = CommonOptions & {
  watch?: boolean;
  format?: Format;
  entry?: string[];
  distPath?: string;
  bundle?: boolean;
  syntax?: Syntax;
  target?: string;
  dts?: boolean;
  externals?: string[];
  minify?: boolean;
  clean?: boolean;
  autoExtension?: boolean;
  autoExternal?: boolean;
  tsconfig?: string;
};

export type InspectOptions = CommonOptions & {
  mode?: RsbuildMode;
  output?: string;
  verbose?: boolean;
};

const applyCommonOptions = (cli: CAC) => {
  cli
    .option(
      '-c, --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .option(
      '-r, --root <root>',
      'specify the project root directory, can be an absolute path or a path relative to cwd',
    )
    .option(
      '--env-mode <mode>',
      'specify the env mode to load the `.env.[mode]` file',
    )
    .option(
      '--config-loader <loader>',
      'Set the config file loader (auto | jiti | native)',
      {
        default: 'auto',
      },
    )
    .option('--env-dir <dir>', 'specify the directory to load `.env` files')
    .option(
      '--log-level <level>',
      'set the log level (info | warn | error | silent)',
    )
    .option(
      '--lib <id>',
      'specify the library (repeatable, e.g. --lib esm --lib cjs)',
      {
        type: [String],
        default: [],
      },
    );
};

export function runCli(): void {
  const cli = cac('rslib');

  cli.help();
  cli.version(RSLIB_VERSION);

  applyCommonOptions(cli);

  const buildCommand = cli.command('build', 'build the library for production');
  const inspectCommand = cli.command(
    'inspect',
    'inspect the Rsbuild / Rspack configs of Rslib projects',
  );
  const mfDevCommand = cli.command(
    'mf-dev',
    'start Rsbuild dev server of Module Federation format',
  );

  buildCommand
    .option('-w, --watch', 'turn on watch mode, watch for changes and rebuild')
    .option('--entry <entry>', 'set entry file or pattern (repeatable)', {
      type: [String],
      default: [],
    })
    .option('--dist-path <dir>', 'set output directory')
    .option('--bundle', 'enable bundle mode (use --no-bundle to disable)')
    .option(
      '--format <format>',
      'specify the output format (esm | cjs | umd | mf | iife)',
    )
    .option('--syntax <syntax>', 'set build syntax target (repeatable)')
    .option('--target <target>', 'set runtime target (web | node)')
    .option('--dts', 'emit declaration files (use --no-dts to disable)')
    .option('--externals <pkg>', 'add package to externals (repeatable)', {
      type: [String],
      default: [],
    })
    .option('--minify', 'minify output (use --no-minify to disable)')
    .option(
      '--clean',
      'clean output directory before build (use --no-clean to disable)',
    )
    .option(
      '--auto-extension',
      'control automatic extension redirect (use --no-auto-extension to disable)',
    )
    .option(
      '--auto-external',
      'control automatic dependency externalization (use --no-auto-external to disable)',
    )
    .option(
      '--tsconfig <path>',
      'use specific tsconfig (relative to project root)',
    )
    .action(async (options: BuildOptions) => {
      try {
        const cliBuild = async () => {
          const { config, watchFiles } = await initConfig(options);
          await build(config, options);
          if (options.watch) {
            watchFilesForRestart(watchFiles, async () => {
              await cliBuild();
            });
          }
        };

        await cliBuild();
      } catch (err) {
        logger.error('Failed to build.');
        if (err instanceof AggregateError) {
          for (const error of err.errors) {
            logger.error(error);
          }
        } else {
          logger.error(err);
        }
        process.exit(1);
      }
    });

  inspectCommand
    .option('--output <output>', 'specify inspect content output path', {
      default: '.rsbuild',
    })
    .option('--verbose', 'show full function definitions in output')
    .action(async (options: InspectOptions) => {
      try {
        // TODO: inspect should output Rslib's config
        const { config } = await initConfig(options);
        await inspect(config, {
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

  mfDevCommand.action(async (options: CommonOptions) => {
    try {
      const cliMfDev = async () => {
        const { config, watchFiles } = await initConfig(options);
        await startMFDevServer(config, {
          lib: options.lib,
        });

        watchFilesForRestart(watchFiles, async () => {
          await cliMfDev();
        });
      };

      await cliMfDev();
    } catch (err) {
      logger.error('Failed to start mf-dev.');
      logger.error(err);
      process.exit(1);
    }
  });

  cli.parse();
}
