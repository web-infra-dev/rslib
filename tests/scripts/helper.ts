import { platform } from 'node:os';
import { join } from 'node:path';
import fse from 'fs-extra';
import { type GlobOptions, convertPathToPattern, glob } from 'tinyglobby';

// tinyglobby only accepts posix path
// https://github.com/SuperchupuDev/tinyglobby?tab=readme-ov-file#api
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
  const files = await glob(convertPath(join(path, '**/*')), {
    absolute: true,
    ...options,
  });
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

export const waitFor = async (
  fn: () => boolean,
  {
    maxChecks = 100,
    interval = 20,
  }: {
    maxChecks?: number;
    interval?: number;
  } = {},
) => {
  let checks = 0;

  while (checks < maxChecks) {
    if (fn()) {
      return true;
    }
    checks++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return false;
};

export const awaitFileExists = async (dir: string) => {
  const result = await waitFor(() => fse.existsSync(dir), { interval: 50 });
  if (!result) {
    throw new Error(`awaitFileExists failed: ${dir}`);
  }
};
