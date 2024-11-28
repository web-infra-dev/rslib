import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import { onBeforeRestartServer, watchFilesForRestart } from '../restart';
import type { RslibConfig } from '../types/config';
import type { BuildOptions } from './commands';
import { loadRslibConfig } from './init';

export async function build(
  config: RslibConfig,
  options: Pick<BuildOptions, 'lib' | 'watch'> & {
    configFilePath?: string;
  } = {},
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

  if (options?.watch) {
    const files: string[] = [];

    if (options.configFilePath) {
      files.push(options.configFilePath);
    }

    onBeforeRestartServer(buildInstance.close);

    watchFilesForRestart(files, async () => {
      const { content: rslibConfig, filePath: configFilePath } =
        await loadRslibConfig(options);

      await build(rslibConfig, {
        configFilePath,
        ...options,
      });
    });
  } else {
    await buildInstance.close();
  }

  return rsbuildInstance;
}
