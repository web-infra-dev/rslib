#!/usr/bin/env node
import { logger } from '@rslib/shared';
import { runCli } from '../dist/es/cli.js';

async function main() {
  try {
    runCli();
  } catch (err) {
    logger.error(err);
  }
}

main();
