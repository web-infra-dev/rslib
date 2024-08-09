import os from 'node:os';
import { vol } from 'memfs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calcLongestCommonPath } from '../src/utils/helper';

vi.mock('node:fs');
vi.mock('node:fs/promises');

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

    if (os.platform() !== 'win32') {
      const result = await calcLongestCommonPath([
        '/Users/Someone/project-a/src/helpers',
        '/Users/Someone/project-a/src',
        '/Users/Someone/project-a/src/utils',
      ]);
      expect(result).toEqual('/Users/Someone/project-a/src');
    } else {
      const result = await calcLongestCommonPath([
        'D:\\Users\\Someone\\project-a\\src\\helpers',
        'D:\\Users\\Someone\\project-a\\src',
        'D:\\Users\\Someone\\project-a\\src\\utils',
      ]);
      expect(result).toEqual('D:\\Users\\Someone\\project-a\\src');
    }
  });

  it('correct 2', async () => {
    vol.fromJSON({ '/Users/Someone/project-monorepo': null });

    if (os.platform() !== 'win32') {
      const result = await calcLongestCommonPath([
        '/Users/Someone/project-monorepo/packages-a/src/index.ts',
        '/Users/Someone/project-monorepo/packages-util/src/index.js',
        '/Users/Someone/project-monorepo/script.js',
      ]);
      expect(result).toEqual('/Users/Someone/project-monorepo');
    } else {
      const result = await calcLongestCommonPath([
        'D:\\Users\\Someone\\project-monorepo\\packages-a\\src\\index.ts',
        'D:\\Users\\Someone\\project-monorepo\\packages-util\\src\\index.js',
        'D:\\Users\\Someone\\project-monorepo\\script.js',
      ]);
      expect(result).toEqual('D:\\Users\\Someone\\project-monorepo');
    }
  });

  it('correct 3', async () => {
    vol.fromJSON({
      '/Users/Someone/project/src/index.js': '',
    });
    if (os.platform() !== 'win32') {
      const result = await calcLongestCommonPath([
        '/Users/Someone/project/src/index.js',
      ]);
      expect(result).toEqual('/Users/Someone/project/src');
    } else {
      const result = await calcLongestCommonPath([
        'D:\\Users\\Someone\\project\\src\\index.js',
      ]);
      expect(result).toEqual('D:\\Users\\Someone\\project\\src');
    }
  });
});
