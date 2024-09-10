import { basename, join } from 'node:path';
import { find, parse } from 'tsconfck';

export async function loadTsconfig(
  root: string,
  tsconfigPath = 'tsconfig.json',
): Promise<{
  compilerOptions?: Record<string, any>;
}> {
  const tsconfigFileName = await find(join(root, tsconfigPath), {
    root,
    configName: basename(tsconfigPath),
  });

  if (tsconfigFileName) {
    const { tsconfig } = await parse(tsconfigFileName);
    return tsconfig;
  }

  return {};
}
