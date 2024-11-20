import { type RsbuildInstance, createRsbuild } from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from '../config';
import type { RslibConfig } from '../types/config';
import { getAbsolutePath } from '../utils/helper';
import type { InspectOptions } from './commands';

export async function inspect(
  config: RslibConfig,
  options: Pick<
    InspectOptions,
    'root' | 'lib' | 'mode' | 'output' | 'verbose'
  > = {},
): Promise<RsbuildInstance> {
  const cwd = process.cwd();
  const root = options.root ? getAbsolutePath(cwd, options.root) : cwd;

  const environments = await composeRsbuildEnvironments(config, root);
  const rsbuildInstance = await createRsbuild({
    rsbuildConfig: {
      environments: pruneEnvironments(environments, options.lib),
    },
  });

  await rsbuildInstance.inspectConfig({
    mode: options.mode,
    verbose: options.verbose,
    outputPath: options.output,
    writeToDisk: true,
  });

  return rsbuildInstance;
}
