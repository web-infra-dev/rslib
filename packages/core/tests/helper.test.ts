import { vol } from 'memfs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calcLongestCommonPath } from '../src/utils/helper';

vi.mock('node:fs');
vi.mock('node:fs/promises');

describe('LCA calculate correctly', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('empty array', async () => {
    const result = await calcLongestCommonPath([]);
    expect(result).toBe(null);
  });

  it('correct 1', async () => {
    vol.fromJSON({ '/Users/Someone/project-a/src': null });

    const result = await calcLongestCommonPath([
      '/Users/Someone/project-a/src/helpers',
      '/Users/Someone/project-a/src',
      '/Users/Someone/project-a/src/utils',
    ]);
    expect(result).toBe('/Users/Someone/project-a/src');
  });

  it('correct 2', async () => {
    vol.fromJSON({ '/Users/Someone/project-monorepo': null });

    const result = await calcLongestCommonPath([
      '/Users/Someone/project-monorepo/packages-a/src/index.ts',
      '/Users/Someone/project-monorepo/packages-util/src/index.js',
      '/Users/Someone/project-monorepo/script.js',
    ]);

    expect(result).toBe('/Users/Someone/project-monorepo');
  });

  it('correct 3', async () => {
    vol.fromJSON({
      '/Users/Someone/project/src/index.js': '',
    });

    const result = await calcLongestCommonPath([
      '/Users/Someone/project/src/index.js',
    ]);

    expect(result).toBe('/Users/Someone/project/src');
  });
});
