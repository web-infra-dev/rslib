import path from 'node:path';
import { loadEnv } from '@rsbuild/core';
import { loadConfig } from '../config';
import type { RslibConfig } from '../types';
import { getAbsolutePath } from '../utils/helper';
import type { CommonOptions } from './commands';
import { onBeforeRestart } from './restart';

const getEnvDir = (cwd: string, envDir?: string) => {
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.resolve(cwd, envDir);
  }
  return cwd;
};

export async function init(options: CommonOptions): Promise<{
  config: RslibConfig;
  configFilePath: string;
  watchFiles: string[];
}> {
  const cwd = process.cwd();
  const root = options.root ? getAbsolutePath(cwd, options.root) : cwd;
  const envs = loadEnv({
    cwd: getEnvDir(root, options.envDir),
    mode: options.envMode,
  });

  onBeforeRestart(envs.cleanup);

  const { content: config, filePath: configFilePath } = await loadConfig({
    cwd: root,
    path: options.config,
    envMode: options.envMode,
    loader: options.configLoader,
  });

  config.source ||= {};
  config.source.define = {
    ...envs.publicVars,
    ...config.source.define,
  };

  if (options.root) {
    config.root = root;
  }

  if (options.logLevel) {
    config.logLevel = options.logLevel;
  }

  return {
    config,
    configFilePath,
    watchFiles: [configFilePath, ...envs.filePaths],
  };
}
