import { createRsbuild } from '@rsbuild/core';
import type { RsbuildInstance } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types';
import type { CommonOptions } from './commands';
import { onBeforeRestart } from './restart';

export async function startMFDevServer(
  config: RslibConfig,
  options: Pick<CommonOptions, 'lib'> = {},
): Promise<RsbuildInstance | undefined> {
  const rsbuildInstance = await initMFRsbuild(config, options);
  return rsbuildInstance;
}

async function initMFRsbuild(
  config: RslibConfig,
  options: Pick<CommonOptions, 'lib'> = {},
): Promise<RsbuildInstance | undefined> {
  const { environments, environmentWithInfos } =
    await composeRsbuildEnvironments(config);

  const selectedEnvironmentIds = environmentWithInfos
    .filter((env) => {
      const isMf = env.format === 'mf';
      if (!options?.lib) {
        return isMf;
      }
      return env.id && options.lib.includes(env.id);
    })
    .map((env) => env.id);

  if (!selectedEnvironmentIds.length) {
    throw new Error('No mf format found, please check your config.');
  }

  const selectedEnvironments = pruneEnvironments(
    environments,
    selectedEnvironmentIds,
  );

  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      mode: 'development',
      root: config.root,
      plugins: config.plugins,
      dev: {
        ...(config.dev ?? {}),
        // TODO: remove this after Rsbuild fix that the environment config of writeToDisk not takes effect
        writeToDisk: true,
      },
      server: config.server,
      environments: selectedEnvironments,
    },
  });

  const devServer = await rsbuildInstance.startDevServer();

  onBeforeRestart(devServer.server.close);
  return rsbuildInstance;
}
