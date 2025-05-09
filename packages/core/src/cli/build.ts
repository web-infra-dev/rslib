import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types/config';
import type { BuildOptions } from './commands';
import { onBeforeRestart } from './restart';

export async function build(
  config: RslibConfig,
  options: Pick<BuildOptions, 'lib' | 'watch' | 'root'> = {},
): Promise<RsbuildInstance> {
  const { environments } = await composeRsbuildEnvironments(config);
  const rsbuildInstance = await createRsbuild({
    callerName: 'rslib',
    rsbuildConfig: {
      mode: 'production',
      root: config.root,
      plugins: config.plugins,
      dev: config.dev,
      server: config.server,
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
