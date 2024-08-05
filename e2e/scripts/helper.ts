import { platform } from 'node:os';
import { join } from 'node:path';
import fg, {
  type Options as GlobOptions,
  convertPathToPattern,
} from 'fast-glob';
import fse from 'fs-extra';

export const getFiles = async (_pattern: string) => {};

// fast-glob only accepts posix path
// https://github.com/mrmlnc/fast-glob#convertpathtopatternpath
const convertPath = (path: string) => {
  if (platform() === 'win32') {
    return convertPathToPattern(path);
  }
  return path;
};

export const globContentJSON = async (path: string, options?: GlobOptions) => {
  const files = await fg(convertPath(join(path, '**/*')), options);
  const ret: Record<string, string> = {};

  await Promise.all(
    files.map((file) =>
      fse.readFile(file, 'utf-8').then((content) => {
        ret[file] = content;
      }),
    ),
  );

  return ret;
};
