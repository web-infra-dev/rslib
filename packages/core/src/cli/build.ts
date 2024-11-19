import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types/config';
import { getAbsolutePath } from '../utils/helper';
import type { BuildOptions } from './commands';

export async function build(
  config: RslibConfig,
  options: Pick<BuildOptions, 'root' | 'lib' | 'watch'> = {},
): Promise<RsbuildInstance> {
  const cwd = process.cwd();
  options.root = options.root ? getAbsolutePath(cwd, options.root) : cwd;

  const environments = await composeRsbuildEnvironments(config, options.root);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      environments: pruneEnvironments(environments, options.lib),
    },
  });

  await rsbuildInstance.build({
    watch: options.watch,
  });

  return rsbuildInstance;
}
