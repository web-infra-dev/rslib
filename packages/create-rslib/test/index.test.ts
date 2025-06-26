import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { composeTemplateName, TEMPLATES } from '../src/helpers';
import { createAndValidate } from './helper';

const CASES_NODE_DUAL = [
  '[node-dual]-[]-js',
  '[node-dual]-[]-ts',
  '[node-dual]-[vitest]-js',
  '[node-dual]-[vitest]-ts',
];

const CASES_NODE_ESM = [
  '[node-esm]-[]-js',
  '[node-esm]-[]-ts',
  '[node-esm]-[vitest]-js',
  '[node-esm]-[vitest]-ts',
];

const CASES_REACT = [
  '[react]-[]-js',
  '[react]-[]-ts',
  '[react]-[storybook,vitest]-js',
  '[react]-[storybook,vitest]-ts',
  '[react]-[storybook]-js',
  '[react]-[vitest]-js',
  '[react]-[storybook]-ts',
  '[react]-[vitest]-ts',
];

const CASES_VUE = [
  '[vue]-[]-js',
  '[vue]-[]-ts',
  '[vue]-[storybook,vitest]-js',
  '[vue]-[storybook,vitest]-ts',
  '[vue]-[storybook]-js',
  '[vue]-[storybook]-ts',
  '[vue]-[vitest]-js',
  '[vue]-[vitest]-ts',
];

test('exhaust all cases', () => {
  expect(TEMPLATES.map(composeTemplateName).sort()).toEqual(
    [
      ...CASES_NODE_DUAL,
      ...CASES_NODE_ESM,
      ...CASES_REACT,
      ...CASES_VUE,
    ].sort(),
  );
});

describe('node-dual', () => {
  for (const c of CASES_NODE_DUAL) {
    test(`should create ${c} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('node-esm', () => {
  for (const c of CASES_NODE_ESM) {
    test(`should create ${c} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('react', () => {
  for (const c of CASES_REACT) {
    test(`should create ${c} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('custom path to create', () => {
  test('should allow to create project in sub dir', async () => {
    createAndValidate(__dirname, '[node-esm]-[]-js', {
      name: 'test-temp-dir/rslib-project',
    });
  });

  test('should allow to create project in relative dir', async () => {
    createAndValidate(__dirname, '[node-esm]-[]-js', {
      name: './test-temp-relative-dir',
    });
  });
});

describe('linter and formatter', () => {
  test('should create project with eslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      '[node-esm]-[]-js',
      {
        name: 'test-temp-eslint',
        tools: ['eslint'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies.eslint).toBeTruthy();
    expect(existsSync(join(dir, 'eslint.config.mjs'))).toBeTruthy();
    clean();
  });

  test('should create project with prettier as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      '[node-esm]-[]-js',
      {
        name: 'test-temp-prettier',
        tools: ['prettier'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies.prettier).toBeTruthy();
    expect(existsSync(join(dir, '.prettierrc'))).toBeTruthy();
    clean();
  });

  test('should create project with eslint and prettier as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      '[node-esm]-[]-js',
      {
        name: 'test-temp-eslint-prettier',
        tools: ['eslint', 'prettier'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies.eslint).toBeTruthy();
    expect(pkgJson.devDependencies.prettier).toBeTruthy();
    expect(existsSync(join(dir, '.prettierrc'))).toBeTruthy();
    expect(existsSync(join(dir, 'eslint.config.mjs'))).toBeTruthy();
    clean();
  });

  test('should create project with biome as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      '[node-esm]-[]-js',
      {
        name: 'test-temp-eslint',
        tools: ['biome'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies['@biomejs/biome']).toBeTruthy();
    expect(existsSync(join(dir, 'biome.json'))).toBeTruthy();
    clean();
  });
});
