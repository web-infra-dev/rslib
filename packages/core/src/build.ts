import type { BuildOptions } from './cli/commands';
import { initRsbuild } from './config';
import type { RslibConfig } from './types/config';

export async function build(config: RslibConfig, options?: BuildOptions) {
  const rsbuildInstance = await initRsbuild(config);

  await rsbuildInstance.build({
    mode: 'production',
    watch: options?.watch,
  });

  return rsbuildInstance;
}
