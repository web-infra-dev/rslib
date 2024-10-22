import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { createAndValidate } from './helper';

test('should create node-dual-js project as expected', async () => {
  createAndValidate(__dirname, 'node-dual-js');
});

test('should create node-dual-ts project as expected', async () => {
  createAndValidate(__dirname, 'node-dual-ts');
});

test('should create node-esm-js project as expected', async () => {
  createAndValidate(__dirname, 'node-esm-js');
});

test('should create node-esm-ts project as expected', async () => {
  createAndValidate(__dirname, 'node-esm-ts');
});

test('should allow to create project in sub dir', async () => {
  createAndValidate(__dirname, 'node-esm-js', {
    name: 'test-temp-dir/rslib-project',
  });
});

test('should allow to create project in relative dir', async () => {
  createAndValidate(__dirname, 'node-esm-js', {
    name: './test-temp-relative-dir',
  });
});

test('should create project with eslint as expected', async () => {
  const { dir, pkgJson, clean } = createAndValidate(__dirname, 'node-esm-js', {
    name: 'test-temp-eslint',
    tools: ['eslint'],
    clean: false,
  });
  expect(pkgJson.devDependencies.eslint).toBeTruthy();
  expect(existsSync(join(dir, 'eslint.config.mjs'))).toBeTruthy();
  clean();
});

test('should create project with prettier as expected', async () => {
  const { dir, pkgJson, clean } = createAndValidate(__dirname, 'node-esm-js', {
    name: 'test-temp-prettier',
    tools: ['prettier'],
    clean: false,
  });
  expect(pkgJson.devDependencies.prettier).toBeTruthy();
  expect(existsSync(join(dir, '.prettierrc'))).toBeTruthy();
  clean();
});

test('should create project with eslint and prettier as expected', async () => {
  const { dir, pkgJson, clean } = createAndValidate(__dirname, 'node-esm-js', {
    name: 'test-temp-eslint-prettier',
    tools: ['eslint', 'prettier'],
    clean: false,
  });
  expect(pkgJson.devDependencies.eslint).toBeTruthy();
  expect(pkgJson.devDependencies.prettier).toBeTruthy();
  expect(existsSync(join(dir, '.prettierrc'))).toBeTruthy();
  expect(existsSync(join(dir, 'eslint.config.mjs'))).toBeTruthy();
  clean();
});

test('should create project with biome as expected', async () => {
  const { dir, pkgJson, clean } = createAndValidate(__dirname, 'node-esm-js', {
    name: 'test-temp-eslint',
    tools: ['biome'],
    clean: false,
  });
  expect(pkgJson.devDependencies['@biomejs/biome']).toBeTruthy();
  expect(existsSync(join(dir, 'biome.json'))).toBeTruthy();
  clean();
});
