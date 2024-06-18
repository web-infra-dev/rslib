import { logger } from '../utils/logger';

function initNodeEnv() {
  if (!process.env.NODE_ENV) {
    const command = process.argv[2] ?? '';
    process.env.NODE_ENV = ['build'].includes(command)
      ? 'production'
      : 'development';
  }
}

export function prepareCli() {
  initNodeEnv();

  // Print a blank line to keep the greet log nice.
  // Some package managers automatically output a blank line, some do not.
  const { npm_execpath } = process.env;
  if (
    !npm_execpath ||
    npm_execpath.includes('npx-cli.js') ||
    npm_execpath.includes('.bun')
  ) {
    console.log();
  }

  logger.greet(`  ${`Rslib v${RSLIB_VERSION}`}\n`);
}
