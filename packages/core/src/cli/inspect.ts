import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types/config';
import type { InspectOptions } from './commands';

export async function inspect(
  config: RslibConfig,
  options: Pick<InspectOptions, 'lib' | 'mode' | 'output' | 'verbose'> = {},
): Promise<RsbuildInstance> {
  const { environments } = await composeRsbuildEnvironments(config);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      mode: 'production',
      root: config.root,
      plugins: config.plugins,
      dev: config.dev,
      server: config.server,
      environments: pruneEnvironments(environments, options.lib),
    },
  });

  await rsbuildInstance.inspectConfig({
    mode: options.mode,
    verbose: options.verbose,
    outputPath: options.output,
    writeToDisk: true,
  });

  return rsbuildInstance;
}
