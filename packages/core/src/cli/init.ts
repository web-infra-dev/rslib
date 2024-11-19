import { loadConfig } from '../config';
import type { RslibConfig } from '../types';
import { getAbsolutePath } from '../utils/helper';
import type { CommonOptions } from './commands';

export async function getRslibConfig(
  options: CommonOptions,
): Promise<{ root: string; rslibConfig: RslibConfig }> {
  const cwd = process.cwd();
  const root = options.root ? getAbsolutePath(cwd, options.root) : cwd;

  const rslibConfig = await loadConfig({
    cwd: root,
    path: options.config,
    envMode: options.envMode,
  });

  return { root, rslibConfig };
}
