import { program } from 'commander';
import { build } from '../build';
import type { RslibConfig } from '../types';

export function runCli() {
  program.name('rslib').usage('<command> [options]').version(RSLIB_VERSION);

  const buildCommand = program.command('build');

  buildCommand
    .description('build the app for production')
    .option('--entry <entry>', 'entrypoint file to build')
    .option('--outDir <outDir>', 'dist directory to build to')
    .action(async (options: RslibConfig) => {
      try {
        await build({
          entry: options.entry,
          outDir: options.outDir,
        });
      } catch (err) {
        process.exit(1);
      }
    });

  program.parse();
}
