import type { LogLevel } from '@rsbuild/core';
import { isDebug, logger } from '../utils/logger';
import { setupCommands } from './commands';

function initNodeEnv() {
  if (!process.env.NODE_ENV) {
    const command = process.argv[2] ?? '';
    process.env.NODE_ENV = ['build', 'inspect'].includes(command)
      ? 'production'
      : 'development';
  }
}

function showGreeting() {
  // Ensure consistent spacing before the greeting message.
  // Different package managers handle output formatting differently - some automatically
  // add a blank line before command output, while others do not.
  const { npm_execpath, npm_lifecycle_event, NODE_RUN_SCRIPT_NAME } =
    process.env;
  const isNpx = npm_lifecycle_event === 'npx';
  const isBun = npm_execpath?.includes('.bun');
  const isNodeRun = Boolean(NODE_RUN_SCRIPT_NAME);
  const prefix = isNpx || isBun || isNodeRun ? '\n' : '';
  logger.greet(`${prefix}Rslib v${RSLIB_VERSION}\n`);
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

export function runCLI(): void {
  // make it easier to identify the process via activity monitor or other tools
  process.title = 'rslib-node';

  initNodeEnv();
  setupLogLevel();
  showGreeting();

  try {
    setupCommands();
  } catch (err) {
    logger.error('Failed to start Rslib CLI.');
    logger.error(err);
    process.exit(1);
  }
}
