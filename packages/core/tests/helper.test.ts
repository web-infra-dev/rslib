import { describe, expect, it } from 'vitest';
import { calcLongestCommonPath } from '../src/utils/helper';

describe('LCA calculate correctly', () => {
  it('empty array', () => {
    const result = calcLongestCommonPath([]);
    expect(result).toBe(null);
  });

  it('correct 1', () => {
    const result = calcLongestCommonPath([
      '/Users/Someone/project-a/src/helpers',
      '/Users/Someone/project-a/src',
      '/Users/Someone/project-a/src/utils',
    ]);
    expect(result).toBe('/Users/Someone/project-a/src');
  });

  it('correct 2', () => {
    const result = calcLongestCommonPath([
      '/Users/Someone/project-monorepo/packages-a/src',
      '/Users/Someone/project-monorepo/packages-util/src',
    ]);
    expect(result).toBe('/Users/Someone/project-monorepo');
  });
});
