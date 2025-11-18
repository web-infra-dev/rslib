import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { platform } from 'node:os';
import { join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect } from '@playwright/test';
import fse from 'fs-extra';
import { convertPathToPattern, type GlobOptions, glob } from 'tinyglobby';

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
    dot: true,
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

/**
 * A faster `expect.poll`
 */
export const expectPoll: (fn: () => boolean) => ReturnType<typeof expect.poll> =
  (fn) => {
    return expect.poll(fn, {
      intervals: [20, 30, 40, 50, 60, 70, 80, 90, 100],
      timeout: process.env.CI ? 10_000 : 5_000,
    });
  };

/**
 * Expect a file to exist
 */
export const expectFile = (dir: string) =>
  expectPoll(() => fs.existsSync(dir)).toBeTruthy();

/**
 * Expect a file to exist and include specified content
 */
export const expectFileWithContent = (
  filePath: string,
  expectedContent: string,
) =>
  expectPoll(() => {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.includes(expectedContent);
    } catch {
      return false;
    }
  }).toBeTruthy();

/**
 * Expect log output from child process
 */
export const expectLog = (child: ChildProcess, log: string) =>
  new Promise<void>((resolve) => {
    const listener = (chunk: Buffer) => {
      console.log('chunk: ', chunk);
      if (stripAnsi(chunk.toString()).includes(log)) {
        resolve();
      }
    };
    child.stdout?.on('data', listener);
    child.stderr?.on('data', listener);
  });

export const expectBuildEnd = (child: ChildProcess) =>
  expectLog(child, 'built in');
