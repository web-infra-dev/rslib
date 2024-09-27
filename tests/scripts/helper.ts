import { platform } from 'node:os';
import { join } from 'node:path';
import fg, {
  type Options as GlobOptions,
  convertPathToPattern,
} from 'fast-glob';
import fse from 'fs-extra';

// fast-glob only accepts posix path
// https://github.com/mrmlnc/fast-glob#convertpathtopatternpath
const convertPath = (path: string) => {
  if (platform() === 'win32') {
    return convertPathToPattern(path);
  }
  return path;
};

export const globContentJSON = async (
  path: string,
  options?: GlobOptions,
): Promise<Record<string, string>> => {
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

type LogLevel = 'error' | 'warn' | 'info' | 'log';
export const proxyConsole = (
  types: LogLevel | LogLevel[] = ['log', 'warn', 'info', 'error'],
) => {
  const logs: string[] = [];
  const restores: Array<() => void> = [];

  for (const type of Array.isArray(types) ? types : [types]) {
    const method = console[type];

    restores.push(() => {
      console[type] = method;
    });

    console[type] = (log) => {
      logs.push(log);
    };
  }

  return {
    logs,
    restore: () => {
      for (const restore of restores) {
        restore();
      }
    },
  };
};
