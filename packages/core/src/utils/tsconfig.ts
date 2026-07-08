import { statSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const isFileSync = (filePath: string): boolean | undefined => {
  try {
    return statSync(filePath, { throwIfNoEntry: false })?.isFile();
  } catch {
    return false;
  }
};

export async function loadTsconfig(
  root: string,
  tsconfigPath = 'tsconfig.json',
): Promise<{
  compilerOptions?: Record<string, any>;
}> {
  const resolvedTsconfigPath = isAbsolute(tsconfigPath)
    ? tsconfigPath
    : join(root, tsconfigPath);

  if (isFileSync(resolvedTsconfigPath)) {
    const { readTsconfig } = await import('get-tsconfig');

    return readTsconfig(resolvedTsconfigPath, {
      typescriptVersion: false,
    }).config;
  }

  return {};
}
