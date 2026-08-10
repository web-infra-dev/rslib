import { describe, expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRslib, loadConfig } from 'rslib';
import type { Lang } from '../src/index';
import { parseTemplateName } from '../src/parseTemplateName';
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

const CASES_NODE: TemplateCase[] = [
  createCase('node', 'js'),
  createCase('node', 'ts'),
];

const CASES_REACT: TemplateCase[] = [
  createCase('react', 'js'),
  createCase('react', 'ts'),
  createCase('react', 'js', ['react-compiler']),
  createCase('react', 'ts', ['react-compiler']),
  createCase('react', 'js', ['storybook']),
  createCase('react', 'js', ['react-compiler', 'storybook']),
  createCase('react', 'ts', ['storybook']),
  createCase('react', 'ts', ['react-compiler', 'storybook']),
  createCase('react', 'ts', ['rspress']),
  createCase('react', 'ts', ['rspress', 'storybook']),
  createCase('react', 'ts', ['react-compiler', 'rspress']),
  createCase('react', 'ts', ['react-compiler', 'rspress', 'storybook']),
];

const CASES_VUE: TemplateCase[] = [
  createCase('vue', 'js'),
  createCase('vue', 'ts'),
  createCase('vue', 'js', ['storybook']),
  createCase('vue', 'ts', ['storybook']),
];

const CASES_SVELTE: TemplateCase[] = [
  createCase('svelte', 'js'),
  createCase('svelte', 'ts'),
];

const CASES_SOLID: TemplateCase[] = [
  createCase('solid', 'js'),
  createCase('solid', 'ts'),
];

const BASE_NODE_JS = createCase('node', 'js');

describe('parseTemplateName', () => {
  test('should handle template with language suffix', () => {
    expect(parseTemplateName('node-js')).toBe('node-js');
    expect(parseTemplateName('node-ts')).toBe('node-ts');
    expect(parseTemplateName('react-ts')).toBe('react-ts');
    expect(parseTemplateName('react-js')).toBe('react-js');
    expect(parseTemplateName('vue-ts')).toBe('vue-ts');
    expect(parseTemplateName('vue-js')).toBe('vue-js');
    expect(parseTemplateName('svelte-js')).toBe('svelte-js');
    expect(parseTemplateName('svelte-ts')).toBe('svelte-ts');
    expect(parseTemplateName('solid-js')).toBe('solid-js');
    expect(parseTemplateName('solid-ts')).toBe('solid-ts');
  });

  test('should handle template without language suffix and default to ts', () => {
    expect(parseTemplateName('node')).toBe('node-ts');
    expect(parseTemplateName('react')).toBe('react-ts');
    expect(parseTemplateName('vue')).toBe('vue-ts');
    expect(parseTemplateName('svelte')).toBe('svelte-ts');
    expect(parseTemplateName('solid')).toBe('solid-ts');
  });

  test('should handle multi-segment template with language suffix', () => {
    expect(parseTemplateName('custom-template-ts')).toBe('custom-template-ts');
    expect(parseTemplateName('custom-template-js')).toBe('custom-template-js');
  });

  test('should handle multi-segment template without language suffix and default to ts', () => {
    expect(parseTemplateName('custom-template')).toBe('custom-template-ts');
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

describe('node', () => {
  for (const c of CASES_NODE) {
    test(`should create and consume ${c.label} project`, async () => {
      const { dir, pkgJson, clean } = createAndValidate(__dirname, c, {
        clean: false,
      });

      try {
        // The generated project has not installed its dependencies, so provide
        // the identity helper that its config imports from @rslib/core.
        const coreProxyPath = join(dir, 'node_modules/@rslib/core');
        mkdirSync(coreProxyPath, { recursive: true });
        writeFileSync(
          join(coreProxyPath, 'package.json'),
          JSON.stringify({ type: 'module', exports: './index.js' }),
        );
        writeFileSync(
          join(coreProxyPath, 'index.js'),
          'export const defineConfig = (config) => config;\n',
        );

        const { content, filePath } = await loadConfig({ cwd: dir });
        expect(filePath).toBe(join(dir, `rslib.config.${c.lang}`));

        const rslib = await createRslib({ cwd: dir, config: content });
        await rslib.build();

        const distPath = join(dir, 'dist');
        expect(existsSync(join(distPath, 'index.js'))).toBe(true);
        expect(existsSync(join(distPath, 'index.cjs'))).toBe(false);
        expect(existsSync(join(distPath, 'index.d.ts'))).toBe(c.lang === 'ts');

        const packageName = JSON.stringify(pkgJson.name);
        const imported = execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '--eval',
            `import { squared } from ${packageName}; process.stdout.write(String(squared(2)));`,
          ],
          { cwd: dir, encoding: 'utf8' },
        );
        const required = execFileSync(
          process.execPath,
          [
            '--input-type=commonjs',
            '--eval',
            `const { squared } = require(${packageName}); process.stdout.write(String(squared(2)));`,
          ],
          { cwd: dir, encoding: 'utf8' },
        );

        expect(imported).toBe('4');
        expect(required).toBe('4');
      } finally {
        clean();
      }
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

describe('svelte', () => {
  for (const c of CASES_SVELTE) {
    test(`should create ${c.label} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('solid', () => {
  for (const c of CASES_SOLID) {
    test(`should create ${c.label} project as expected`, async () => {
      createAndValidate(__dirname, c);
    });
  }
});

describe('custom path to create', () => {
  test('should allow to create project in sub dir', async () => {
    createAndValidate(__dirname, BASE_NODE_JS, {
      name: 'test-temp-dir/rslib-project',
    });
  });

  test('should allow to create project in relative dir', async () => {
    createAndValidate(__dirname, BASE_NODE_JS, {
      name: './test-temp-relative-dir',
    });
  });
});

describe('linter and formatter', () => {
  test('should create project with eslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(__dirname, BASE_NODE_JS, {
      name: 'test-temp-eslint',
      tools: ['eslint'],
      clean: false,
    });
    expect(pkgJson.devDependencies.eslint).toBeTruthy();
    expect(existsSync(join(dir, 'eslint.config.mjs'))).toBeTruthy();
    clean();
  });

  test('should create React project with eslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      createCase('react', 'ts'),
      {
        name: 'test-temp-react-eslint',
        tools: ['eslint'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies.eslint).toBeTruthy();
    expect(pkgJson.devDependencies['eslint-plugin-react-hooks']).toBeTruthy();
    expect(pkgJson.devDependencies['eslint-plugin-react-refresh']).toBeTruthy();

    const configContent = readFileSync(join(dir, 'eslint.config.mjs'), 'utf-8');
    expect(configContent).toContain(
      "reactHooks.configs.flat['recommended-latest']",
    );
    expect(configContent).toContain('reactRefresh.configs.recommended');
    clean();
  });

  test('should create Vue project with eslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      createCase('vue', 'ts'),
      {
        name: 'test-temp-vue-eslint',
        tools: ['eslint'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies.eslint).toBeTruthy();
    expect(pkgJson.devDependencies['eslint-plugin-vue']).toBeTruthy();
    expect(
      pkgJson.devDependencies['@vue/eslint-config-typescript'],
    ).toBeTruthy();

    const configContent = readFileSync(join(dir, 'eslint.config.mjs'), 'utf-8');
    expect(configContent).toContain("pluginVue.configs['flat/essential']");
    expect(configContent).toContain('vueTsConfigs.recommended');
    clean();
  });

  test('should create React project with rslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      createCase('react', 'ts'),
      {
        name: 'test-temp-react-rslint',
        tools: ['rslint'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies['@rslint/core']).toBeTruthy();

    const configContent = readFileSync(join(dir, 'rslint.config.ts'), 'utf-8');
    expect(configContent).toContain('reactPlugin.configs.recommended');
    expect(configContent).toContain('ts.configs.recommended');
    clean();
  });

  test('should create Vue project with vanilla rslint as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(
      __dirname,
      createCase('vue', 'js'),
      {
        name: 'test-temp-vue-rslint',
        tools: ['rslint'],
        clean: false,
      },
    );
    expect(pkgJson.devDependencies['@rslint/core']).toBeTruthy();

    const configContent = readFileSync(join(dir, 'rslint.config.ts'), 'utf-8');
    expect(configContent).toContain('js.configs.recommended');
    expect(configContent).not.toContain('ts.configs.recommended');
    expect(configContent).not.toContain('reactPlugin');
    clean();
  });

  test('should create project with prettier as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(__dirname, BASE_NODE_JS, {
      name: 'test-temp-prettier',
      tools: ['prettier'],
      clean: false,
    });
    expect(pkgJson.devDependencies.prettier).toBeTruthy();
    expect(existsSync(join(dir, '.prettierrc'))).toBeTruthy();
    clean();
  });

  test('should create project with eslint and prettier as expected', async () => {
    const { dir, pkgJson, clean } = createAndValidate(__dirname, BASE_NODE_JS, {
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
    const { dir, pkgJson, clean } = createAndValidate(__dirname, BASE_NODE_JS, {
      name: 'test-temp-eslint',
      tools: ['biome'],
      clean: false,
    });
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
