import type { RsbuildInstance } from '@rsbuild/core';
import { createRsbuild } from '@rsbuild/core';
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
      if (!options?.lib || options.lib.length === 0) {
        return isMf;
      }
      return env.id && options.lib.includes(env.id);
    })
    .map((env) => env.id);

  if (!selectedEnvironmentIds.length) {
    throw new Error(
      `No mf format found in ${
        options.lib
          ? `libs ${options.lib.map((lib) => `"${lib}"`).join(', ')}`
          : 'your config'
      }, please check your config to ensure that the mf format is enabled correctly.`,
    );
  }

  const selectedEnvironments = pruneEnvironments(
    environments,
    selectedEnvironmentIds,
  );

  const rsbuildInstance = await createRsbuild({
    callerName: 'rslib',
    rsbuildConfig: {
      mode: 'development',
      root: config.root,
      plugins: config.plugins,
      dev: config.dev,
      server: config.server,
      environments: selectedEnvironments,
    },
  });

  const devServer = await rsbuildInstance.startDevServer();

  onBeforeRestart(devServer.server.close);
  return rsbuildInstance;
}
