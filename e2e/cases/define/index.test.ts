import { join } from 'node:path';
import { type RslibConfig, build } from '@rslib/core';
import { expect, test } from 'vitest';
import { globContentJSON } from '#helper';

test('define', async () => {
  delete process.env.NODE_ENV;

  const rslibConfig: RslibConfig = {
    lib: [
      {
        format: 'esm',
        output: {
          distPath: {
            root: join(__dirname, './dist/esm'),
          },
        },
      },
      {
        format: 'cjs',
        output: {
          distPath: {
            root: join(__dirname, './dist/cjs'),
          },
        },
      },
    ],
    source: {
      entry: {
        main: join(__dirname, './js/src/index.js'),
      },
      define: {
        VERSION: JSON.stringify('1.0.0'),
      },
    },
  };

  const instance = await build(rslibConfig);

  const results = await globContentJSON(instance[0]!.context.distPath, {
    absolute: true,
    ignore: ['/**/*.map'],
  });

  const entryJs = Object.keys(results).find((file) => file.endsWith('.js'));
  expect(results[entryJs!]).not.toContain('console.info(VERSION)');
});
