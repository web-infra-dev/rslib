import { expect, test } from '@rstest/core';
import { getWatchFilesForRestart } from '../src/restart';
import type { RslibInstance } from '../src/types';

test('should get files for restart', () => {
  const rslib = {
    getRslibConfig: () => ({
      _privateMeta: {
        configFilePath: 'rslib.config.ts',
        envFilePaths: ['.env'],
      },
      dev: {
        watchFiles: [
          {
            paths: 'rstack.config.ts',
            type: 'reload-server',
          },
          {
            paths: ['shared.ts', 'constants.ts'],
            type: 'reload-server',
          },
          {
            paths: 'index.html',
            type: 'reload-page',
          },
        ],
      },
    }),
  } as RslibInstance;

  expect(getWatchFilesForRestart(rslib)).toEqual([
    'rslib.config.ts',
    '.env',
    'rstack.config.ts',
    'shared.ts',
    'constants.ts',
  ]);
});
