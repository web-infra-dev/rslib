import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import {
  composeRsbuildEnvironments,
  loadConfig,
  pruneEnvironments,
} from '../config';
import { onBeforeRestartServer, watchFilesForRestart } from '../restart';
import type { BuildOptions } from './commands';

export async function build(
  options: BuildOptions = {},
): Promise<RsbuildInstance> {
  const { content: config, filePath: configFilePath } = await loadConfig({
    path: options?.config,
    envMode: options?.envMode,
  });

  const environments = await composeRsbuildEnvironments(config);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      environments: pruneEnvironments(environments, options.lib),
    },
  });

  const buildInstance = await rsbuildInstance.build({
    watch: options.watch,
  });

  if (options?.watch) {
    const files: string[] = [];
    files.push(configFilePath);

    onBeforeRestartServer(buildInstance.close);

    watchFilesForRestart(files, async () => {
      await build(options);
    });
  } else {
    await buildInstance.close();
  }

  return rsbuildInstance;
}
