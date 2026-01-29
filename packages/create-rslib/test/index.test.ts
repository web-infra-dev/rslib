import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { composeTemplateName, type Lang, TEMPLATES } from '../src/helpers';
import { createAndValidate, type TemplateCase } from './helper';

const createCase = (
  template: string,
  lang: Lang,
  tools: string[] = [],
): TemplateCase => ({
  template,
  lang,
  tools,
  label: composeTemplateName({ template, lang, tools }),
});

const CASES_NODE_DUAL: TemplateCase[] = [
  createCase('node-dual', 'js'),
  createCase('node-dual', 'ts'),
  createCase('node-dual', 'js', ['rstest']),
  createCase('node-dual', 'ts', ['rstest']),
  createCase('node-dual', 'js', ['vitest']),
  createCase('node-dual', 'ts', ['vitest']),
];

const CASES_NODE_ESM: TemplateCase[] = [
  createCase('node-esm', 'js'),
  createCase('node-esm', 'ts'),
  createCase('node-esm', 'js', ['rstest']),
  createCase('node-esm', 'ts', ['rstest']),
  createCase('node-esm', 'js', ['vitest']),
  createCase('node-esm', 'ts', ['vitest']),
];

const CASES_REACT: TemplateCase[] = [
  createCase('react', 'js'),
  createCase('react', 'ts'),
  createCase('react', 'js', ['rstest', 'storybook']),
  createCase('react', 'ts', ['rstest', 'storybook']),
  createCase('react', 'js', ['storybook', 'vitest']),
  createCase('react', 'ts', ['storybook', 'vitest']),
  createCase('react', 'js', ['storybook']),
  createCase('react', 'js', ['rstest']),
  createCase('react', 'js', ['vitest']),
  createCase('react', 'ts', ['storybook']),
  createCase('react', 'ts', ['rstest']),
  createCase('react', 'ts', ['vitest']),
  createCase('react', 'js', ['rspress']),
  createCase('react', 'ts', ['rspress']),
  createCase('react', 'js', ['rspress', 'storybook']),
  createCase('react', 'ts', ['rspress', 'storybook']),
  createCase('react', 'js', ['rspress', 'vitest']),
  createCase('react', 'ts', ['rspress', 'vitest']),
  createCase('react', 'js', ['rspress', 'rstest']),
  createCase('react', 'ts', ['rspress', 'rstest']),
  createCase('react', 'js', ['rspress', 'rstest', 'storybook']),
  createCase('react', 'ts', ['rspress', 'rstest', 'storybook']),
  createCase('react', 'js', ['rspress', 'storybook', 'vitest']),
  createCase('react', 'ts', ['rspress', 'storybook', 'vitest']),
];

const CASES_VUE: TemplateCase[] = [
  createCase('vue', 'js'),
  createCase('vue', 'ts'),
  createCase('vue', 'js', ['rstest', 'storybook']),
  createCase('vue', 'ts', ['rstest', 'storybook']),
  createCase('vue', 'js', ['storybook', 'vitest']),
  createCase('vue', 'ts', ['storybook', 'vitest']),
  createCase('vue', 'js', ['storybook']),
  createCase('vue', 'ts', ['storybook']),
  createCase('vue', 'js', ['rstest']),
  createCase('vue', 'ts', ['rstest']),
  createCase('vue', 'js', ['vitest']),
  createCase('vue', 'ts', ['vitest']),
];

const ALL_CASES = [
  ...CASES_NODE_DUAL,
  ...CASES_NODE_ESM,
  ...CASES_REACT,
  ...CASES_VUE,
];

const BASE_NODE_ESM_JS = createCase('node-esm', 'js');

test('exhaust all cases', () => {
  const expected = ALL_CASES.map((item) => item.label).sort();
  const actual = TEMPLATES.map((t) =>
    composeTemplateName({
      template: t.template,
      lang: t.lang,
      tools: Object.keys(t.tools || {}),
    }),
  ).sort();
  expect(actual).toEqual(expected);
});

describe('node-dual', () => {
  for (const c of CASES_NODE_DUAL) {
    test(`should create ${c.label} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('node-esm', () => {
  for (const c of CASES_NODE_ESM) {
    test(`should create ${c.label} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('react', () => {
  for (const c of CASES_REACT) {
    test(`should create ${c.label} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('custom path to create', () => {
  test('should allow to create project in sub dir', async () => {
    createAndValidate(__dirname, BASE_NODE_ESM_JS, {
      name: 'test-temp-dir/rslib-project',
    });
  });

  test('should allow to create project in relative dir', async () => {
    createAndValidate(__dirname, BASE_NODE_ESM_JS, {
      name: './test-temp-relative-dir',
    });
  });
});

describe('linter and formatter', () => {
  test('should create project with eslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      BASE_NODE_ESM_JS,
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
      BASE_NODE_ESM_JS,
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
      BASE_NODE_ESM_JS,
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
      BASE_NODE_ESM_JS,
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
