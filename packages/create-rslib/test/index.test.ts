import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { type Lang, parseTemplateName } from '../src/index';
import { createAndValidate, type TemplateCase } from './helper';

const createCase = (
  template: string,
  lang: Lang,
  tools: string[] = [],
): TemplateCase => ({
  template,
  lang,
  tools,
  label: `${template}-${lang}${tools.length ? `-${tools.sort().join('-')}` : ''}`,
});

const CASES_NODE_DUAL: TemplateCase[] = [
  createCase('node-dual', 'js'),
  createCase('node-dual', 'ts'),
  createCase('node-dual', 'js', ['rstest']),
  createCase('node-dual', 'ts', ['rstest']),
];

const CASES_NODE_ESM: TemplateCase[] = [
  createCase('node-esm', 'js'),
  createCase('node-esm', 'ts'),
  createCase('node-esm', 'js', ['rstest']),
  createCase('node-esm', 'ts', ['rstest']),
];

const CASES_REACT: TemplateCase[] = [
  createCase('react', 'js'),
  createCase('react', 'ts'),
  createCase('react', 'js', ['rstest', 'storybook']),
  createCase('react', 'ts', ['rstest', 'storybook']),
  createCase('react', 'js', ['storybook']),
  createCase('react', 'js', ['rstest']),
  createCase('react', 'ts', ['storybook']),
  createCase('react', 'ts', ['rstest']),
  createCase('react', 'ts', ['rspress']),
  createCase('react', 'ts', ['rspress', 'storybook']),
  createCase('react', 'ts', ['rspress', 'rstest']),
  createCase('react', 'ts', ['rspress', 'rstest', 'storybook']),
];

const CASES_VUE: TemplateCase[] = [
  createCase('vue', 'js'),
  createCase('vue', 'ts'),
  createCase('vue', 'js', ['rstest', 'storybook']),
  createCase('vue', 'ts', ['rstest', 'storybook']),
  createCase('vue', 'js', ['storybook']),
  createCase('vue', 'ts', ['storybook']),
  createCase('vue', 'js', ['rstest']),
  createCase('vue', 'ts', ['rstest']),
];

const BASE_NODE_ESM_JS = createCase('node-esm', 'js');

describe('parseTemplateName', () => {
  test('should handle template with language suffix', () => {
    expect(parseTemplateName('react-ts')).toBe('react-ts');
    expect(parseTemplateName('react-js')).toBe('react-js');
    expect(parseTemplateName('vue-ts')).toBe('vue-ts');
    expect(parseTemplateName('vue-js')).toBe('vue-js');
  });

  test('should handle template without language suffix and default to ts', () => {
    expect(parseTemplateName('react')).toBe('react-ts');
    expect(parseTemplateName('vue')).toBe('vue-ts');
  });

  test('should handle multi-segment template with language suffix', () => {
    expect(parseTemplateName('node-dual-ts')).toBe('node-dual-ts');
    expect(parseTemplateName('node-dual-js')).toBe('node-dual-js');
    expect(parseTemplateName('node-esm-ts')).toBe('node-esm-ts');
    expect(parseTemplateName('node-esm-js')).toBe('node-esm-js');
  });

  test('should handle multi-segment template without language suffix and default to ts', () => {
    expect(parseTemplateName('node-dual')).toBe('node-dual-ts');
    expect(parseTemplateName('node-esm')).toBe('node-esm-ts');
  });

  test('should throw error when input is just a language suffix', () => {
    expect(() => parseTemplateName('ts')).toThrow(
      'Invalid template name: "ts". Template name cannot be just a language suffix.',
    );
    expect(() => parseTemplateName('js')).toThrow(
      'Invalid template name: "js". Template name cannot be just a language suffix.',
    );
  });
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

describe('vue', () => {
  for (const c of CASES_VUE) {
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

describe('rspress template', () => {
  test('should replace {{ packageName }} placeholder in template files', async () => {
    const templateCase = createCase('react', 'ts', ['rspress']);
    const projectName = 'test-temp-rspress-placeholder';
    const { dir, clean } = createAndValidate(__dirname, templateCase, {
      name: projectName,
      clean: false,
    });

    // Verify docs/Button.mdx has the actual package name, not the placeholder
    const buttonMdxPath = join(dir, 'docs/Button.mdx');
    expect(existsSync(buttonMdxPath)).toBeTruthy();
    const buttonMdxContent = readFileSync(buttonMdxPath, 'utf-8');
    expect(buttonMdxContent).not.toContain('{{ packageName }}');
    expect(buttonMdxContent).toContain(`from '${projectName}'`);

    // Verify tsconfig.json has the actual package name in paths
    const tsconfigPath = join(dir, 'tsconfig.json');
    expect(existsSync(tsconfigPath)).toBeTruthy();
    const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
    expect(tsconfigContent).not.toContain('{{ packageName }}');
    expect(tsconfigContent).toContain(`"${projectName}"`);

    clean();
  });
});
