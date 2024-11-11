import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import type { BuildOptions } from './cli/commands';
import { composeRsbuildEnvironments, pruneEnvironments } from './config';
import type { RslibConfig } from './types/config';

export async function build(
  config: RslibConfig,
  options?: BuildOptions,
): Promise<RsbuildInstance> {
  const environments = await composeRsbuildEnvironments(config);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      environments: pruneEnvironments(environments, options?.lib),
    },
  });

  await rsbuildInstance.build({
    watch: options?.watch,
  });

  return rsbuildInstance;
}
