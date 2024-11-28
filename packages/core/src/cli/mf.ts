import { createRsbuild, mergeRsbuildConfig } from '@rsbuild/core';
import type { RsbuildConfig, RsbuildInstance } from '@rsbuild/core';
import { composeCreateRsbuildConfig } from '../config';
import type { RslibConfig } from '../types';
import { onBeforeRestartServer } from './restart';

export async function startMFDevServer(
  config: RslibConfig,
): Promise<RsbuildInstance | undefined> {
  const rsbuildInstance = await initMFRsbuild(config);
  return rsbuildInstance;
}

async function initMFRsbuild(
  rslibConfig: RslibConfig,
): Promise<RsbuildInstance | undefined> {
  const rsbuildConfigObject = await composeCreateRsbuildConfig(rslibConfig);
  const mfRsbuildConfig = rsbuildConfigObject.find(
    (config) => config.format === 'mf',
  );

  if (!mfRsbuildConfig) {
    // no mf format, return.
    return;
  }

  mfRsbuildConfig.config = changeEnvToDev(mfRsbuildConfig.config);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: mfRsbuildConfig.config,
  });
  const devServer = await rsbuildInstance.startDevServer();

  onBeforeRestartServer(devServer.server.close);
  return rsbuildInstance;
}

function changeEnvToDev(rsbuildConfig: RsbuildConfig) {
  return mergeRsbuildConfig(rsbuildConfig, {
    mode: 'development',
    dev: {
      writeToDisk: true,
    },
    tools: {
      rspack: {
        optimization: {
          nodeEnv: 'development',
          moduleIds: 'named',
        },
      },
    },
  });
}
