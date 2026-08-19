import os from 'node:os';
import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { vol } from 'memfs';
import { calcLongestCommonPath } from '../src/utils/helper';

rs.mock('node:fs');
rs.mock('node:fs/promises');

// LCP test mock will affect other tests
describe('LCP calculate correctly', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('empty array', async () => {
    const result = await calcLongestCommonPath([]);
    expect(result).toBe(null);
  });

  it('correct 1', async () => {
    vol.fromJSON({ '/Users/Someone/project-a/src': null });

    const [paths, expected] =
      os.platform() !== 'win32'
        ? [
            [
              '/Users/Someone/project-a/src/helpers',
              '/Users/Someone/project-a/src',
              '/Users/Someone/project-a/src/utils',
            ],
            '/Users/Someone/project-a/src',
          ]
        : [
            [
              'D:/Users/Someone/project-a/src/helpers',
              'D:/Users/Someone/project-a/src',
              'D:/Users/Someone/project-a/src/utils',
            ],
            'D:/Users/Someone/project-a/src',
          ];
    const result = await calcLongestCommonPath(paths);
    expect(result).toEqual(expected);
  });

  it('correct 2', async () => {
    vol.fromJSON({ '/Users/Someone/project-monorepo': null });

    const [paths, expected] =
      os.platform() !== 'win32'
        ? [
            [
              '/Users/Someone/project-monorepo/packages-a/src/index.ts',
              '/Users/Someone/project-monorepo/packages-util/src/index.js',
              '/Users/Someone/project-monorepo/script.js',
            ],
            '/Users/Someone/project-monorepo',
          ]
        : [
            [
              'D:/Users/Someone/project-monorepo/packages-a/src/index.ts',
              'D:/Users/Someone/project-monorepo/packages-util/src/index.js',
              'D:/Users/Someone/project-monorepo/script.js',
            ],
            'D:/Users/Someone/project-monorepo',
          ];
    const result = await calcLongestCommonPath(paths);
    expect(result).toEqual(expected);
  });

  it('correct 3', async () => {
    vol.fromJSON({
      '/Users/Someone/project/src/index.js': '',
    });
    const [paths, expected] =
      os.platform() !== 'win32'
        ? [
            ['/Users/Someone/project/src/index.js'],
            '/Users/Someone/project/src',
          ]
        : [
            ['D:/Users/Someone/project/src/index.js'],
            'D:/Users/Someone/project/src',
          ];
    const result = await calcLongestCommonPath(paths);
    expect(result).toEqual(expected);
  });
});
