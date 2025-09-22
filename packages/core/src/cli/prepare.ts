import type { LogLevel } from '@rsbuild/core';
import { isDebug, logger } from '../utils/logger';

function initNodeEnv() {
  if (!process.env.NODE_ENV) {
    const command = process.argv[2] ?? '';
    process.env.NODE_ENV = ['build'].includes(command)
      ? 'production'
      : 'development';
  }
}

// ensure log level is set before any log is printed
function setupLogLevel() {
  const logLevelIndex = process.argv.findIndex(
    (item) => item === '--log-level' || item === '--logLevel',
  );
  if (logLevelIndex !== -1) {
    const level = process.argv[logLevelIndex + 1];
    if (level && ['warn', 'error', 'silent'].includes(level) && !isDebug()) {
      logger.level = level as LogLevel;
    }
  }
}

export function prepareCli(): void {
  initNodeEnv();
  setupLogLevel();

  // Print a blank line to keep the greet log nice.
  // Some package managers automatically output a blank line, some do not.
  const { npm_execpath } = process.env;
  if (
    !npm_execpath ||
    npm_execpath.includes('npx-cli.js') ||
    npm_execpath.includes('.bun')
  ) {
    logger.log();
  }

  logger.greet(`  Rslib v${RSLIB_VERSION}\n`);
}
