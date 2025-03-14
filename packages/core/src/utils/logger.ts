/**
 * Logging message case convention:
 *
 * Info, ready, success and debug messages:
 * - Start with lowercase
 * - Example: "info  build started..."
 *
 * Errors and warnings:
 * - Start with uppercase
 * - Example: "error  Failed to build"
 *
 * This convention helps distinguish between normal operations
 * and important alerts that require attention.
 */
import { type Logger, logger } from 'rslog';
import { color } from './helper';

export const isDebug = (): boolean => {
  if (!process.env.DEBUG) {
    return false;
  }

  const values = process.env.DEBUG.toLocaleLowerCase().split(',');
  return ['rslib', 'rs*', 'rstack', '*'].some((key) => values.includes(key));
};

// setup the logger level
if (isDebug()) {
  logger.level = 'verbose';
}

function getTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

logger.override({
  debug: (message, ...args) => {
    if (logger.level !== 'verbose') {
      return;
    }
    const time = color.gray(`${getTime()}`);
    console.log(`  ${color.green('rslib')} ${time} ${message}`, ...args);
  },
});

export { logger };
export type { Logger };
