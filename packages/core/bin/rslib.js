#!/usr/bin/env node
import { logger, prepareCli, runCli } from '../dist/main.js';

async function main() {
  prepareCli();

  try {
    runCli();
  } catch (err) {
    logger.error(err);
  }
}

main();
