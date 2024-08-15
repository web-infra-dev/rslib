import { join } from 'node:path';
import { describe, expect, it, test, vi } from 'vitest';
import { isRelativePath, readPackageJson } from '../src/utils/helper';

vi.mock('rslog');

it('readPackageJson correctly', async () => {
  expect(readPackageJson('path/to/root')).toBeUndefined();

  expect(readPackageJson(join(__dirname, 'fixtures/config/esm'))).toEqual({
    type: 'module',
  });
});

describe('isRelativePath', () => {
  test('should return true for relative paths', () => {
    expect(isRelativePath('../Documents/file.txt')).toBe(true);
    expect(isRelativePath('./file.txt')).toBe(true);
  });

  test('should return false for absolute paths', () => {
    expect(isRelativePath('file.txt')).toBe(false);
    expect(isRelativePath('/Users/username/Documents/file.txt')).toBe(false);
    expect(isRelativePath('C:\\Users\\username\\Documents\\file.txt')).toBe(
      false,
    );
  });

  test('should handle edge cases', () => {
    expect(isRelativePath('')).toBe(false); // empty path
    expect(isRelativePath('.')).toBe(true); // current directory
    expect(isRelativePath('./')).toBe(true); // current directory
  });
});
