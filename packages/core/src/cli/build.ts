import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types/config';
import type { BuildOptions } from './commands';

export async function build(
  config: RslibConfig,
  options: Pick<BuildOptions, 'lib' | 'watch'> = {},
): Promise<RsbuildInstance> {
  const environments = await composeRsbuildEnvironments(config);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      environments: pruneEnvironments(environments, options.lib),
    },
  });

  await rsbuildInstance.build({
    watch: options.watch,
  });

  return rsbuildInstance;
}
