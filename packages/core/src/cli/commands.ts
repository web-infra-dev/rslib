import { type Command, program } from 'commander';
import { build } from '../build';
import { loadConfig } from '../config';
import { logger } from '../utils/logger';

export type CommonOptions = {
  config?: string;
  envMode?: string;
};

export type BuildOptions = CommonOptions & {
  watch?: boolean;
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

export function runCli() {
  program.name('rslib').usage('<command> [options]').version(RSLIB_VERSION);

  const buildCommand = program.command('build');

  [buildCommand].forEach(applyCommonOptions);

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

  program.parse();
}
