import path from 'node:path';
import { color, debounce, isTTY } from '../utils/helper';
import { logger } from '../utils/logger';

export async function watchFilesForRestart(
  files: string[],
  restart: () => Promise<void>,
): Promise<void> {
  if (!files.length) {
    return;
  }

  const chokidar = await import('chokidar');

  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
    // If watching fails due to read permissions, the errors will be suppressed silently.
    ignorePermissionErrors: true,
  });

  const callback = debounce(
    async (filePath) => {
      watcher.close();

      await beforeRestart({ filePath });
      await restart();
    },
    // set 300ms debounce to avoid restart frequently
    300,
  );

  watcher.on('add', callback);
  watcher.on('change', callback);
  watcher.on('unlink', callback);
}

type Cleaner = () => Promise<unknown> | unknown;

let cleaners: Cleaner[] = [];

/**
 * Add a cleaner to handle side effects
 */
export const onBeforeRestart = (cleaner: Cleaner): void => {
  cleaners.push(cleaner);
};

const clearConsole = () => {
  if (isTTY() && !process.env.DEBUG) {
    process.stdout.write('\x1B[H\x1B[2J');
  }
};

const beforeRestart = async ({
  filePath,
  clear = true,
}: {
  filePath?: string;
  clear?: boolean;
} = {}): Promise<void> => {
  if (clear) {
    clearConsole();
  }

  if (filePath) {
    const filename = path.basename(filePath);
    logger.info(`restart because ${color.yellow(filename)} is changed.\n`);
  } else {
    logger.info('restarting...\n');
  }

  for (const cleaner of cleaners) {
    await cleaner();
  }
  cleaners = [];
};
