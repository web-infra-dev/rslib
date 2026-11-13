import { expect, test } from '@rstest/core';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';

test('executes shared CJS dependencies before and after bundling again', async () => {
  // Build the library first, then consume its emitted entries in another build.
  for (const [configPath, outputDir] of [
    ['rslib.config.ts', 'esm'],
    ['rslibConsumer.config.ts', 'consumer'],
  ] as const) {
    await buildAndGetResults({ fixturePath: __dirname, configPath });

    for (const entry of ['a', 'b']) {
      const { value } = await import(
        pathToFileURL(join(__dirname, 'dist', outputDir, `${entry}.mjs`)).href
      );
      expect(value).toBe(`42:${entry}`);
    }
  }
});
