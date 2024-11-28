import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types/config';
import type { BuildOptions } from './commands';
import { onBeforeRestart } from './restart';

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

  const buildInstance = await rsbuildInstance.build({
    watch: options.watch,
  });

  if (options.watch) {
    onBeforeRestart(buildInstance.close);
  } else {
    await buildInstance.close();
  }

  return rsbuildInstance;
}
