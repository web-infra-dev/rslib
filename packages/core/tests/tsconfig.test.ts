import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { loadTsconfig } from '../src/utils/tsconfig';

describe('loadTsconfig', () => {
  it('should return tsconfig when a valid tsconfig file is found', async () => {
    const fixtureDir = join(__dirname, 'fixtures/tsconfig/exist');
    const result1 = await loadTsconfig(fixtureDir);
    const result2 = await loadTsconfig(fixtureDir, './tsconfig.custom.json');

    expect(result1).toMatchInlineSnapshot(`
      {
        "compilerOptions": {
          "rootDir": "./",
        },
      }
    `);
    expect(result2).toMatchInlineSnapshot(`
      {
        "compilerOptions": {
          "rootDir": "custom",
        },
      }
    `);
  });

  it('should return an empty object when no tsconfig file is found', async () => {
    const fixtureDir = join(__dirname, 'fixtures/tsconfig/no-exist');
    const result = await loadTsconfig(fixtureDir);

    expect(result).toEqual({});
  });
});
