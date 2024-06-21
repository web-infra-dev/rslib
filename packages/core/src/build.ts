import type { RsbuildInstance } from '@rsbuild/core';
import type { BuildOptions } from './cli/commands';
import { initRsbuild } from './config';
import type { RslibConfig } from './types/config';

export async function build(config: RslibConfig, options?: BuildOptions) {
  const rsbuildInstances = await initRsbuild(config);

  const buildPromises = rsbuildInstances.map(
    async (rsbuildInstance: RsbuildInstance) => {
      return await rsbuildInstance.build({
        mode: 'production',
        watch: options?.watch,
      });
    },
  );

  await Promise.all(buildPromises);

  return rsbuildInstances;
}
