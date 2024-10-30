import { initDevMFRsbuild } from './config';

import type { RsbuildInstance } from '@rsbuild/core';
import type { RslibConfig } from './types/config';

export async function dev(config: RslibConfig): Promise<RsbuildInstance> {
  const rsbuildInstance = await initDevMFRsbuild(config);

  await rsbuildInstance.startDevServer();

  return rsbuildInstance;
}
