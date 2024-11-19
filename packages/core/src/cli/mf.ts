import { createRsbuild, mergeRsbuildConfig } from '@rsbuild/core';
import type { RsbuildConfig, RsbuildInstance } from '@rsbuild/core';
import { composeCreateRsbuildConfig } from '../config';
import type { RslibConfig } from '../types';
import { getAbsolutePath } from '../utils/helper';
import type { CommonOptions } from './commands';

export async function startMFDevServer(
  config: RslibConfig,
  options: Pick<CommonOptions, 'root'> = {},
): Promise<RsbuildInstance | undefined> {
  const cwd = process.cwd();
  options.root = options.root ? getAbsolutePath(cwd, options.root) : cwd;
  const rsbuildInstance = await initMFRsbuild(config, options.root);
  return rsbuildInstance;
}

async function initMFRsbuild(
  rslibConfig: RslibConfig,
  root: string,
): Promise<RsbuildInstance | undefined> {
  const rsbuildConfigObject = await composeCreateRsbuildConfig(
    rslibConfig,
    root,
  );
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
  await rsbuildInstance.startDevServer();
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
        },
      },
    },
  });
}
