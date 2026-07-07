import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { expect } from '@rstest/core';
import fse from 'fs-extra';
import type { Lang } from '../src/index';

export const expectPackageJson = (
  pkgJson: Record<string, any>,
  name: string,
  template: string,
  lang: Lang,
) => {
  expect(pkgJson.name).toBe(name);
  expect(pkgJson.scripts.dev).toBe('rslib --watch');
  // Vue TS template has additional vue-tsc check
  if (template === 'vue' && lang === 'ts') {
    expect(pkgJson.scripts.build).toBe('rslib && vue-tsc');
  } else {
    expect(pkgJson.scripts.build).toBe('rslib');
  }
  expect(pkgJson.devDependencies['@rslib/core']).toBeTruthy();
  expect(pkgJson.scripts.test).toBe('rstest');
  expect(pkgJson.scripts['test:watch']).toBe('rstest --watch');
  expect(pkgJson.devDependencies['@rstest/adapter-rslib']).toBeTruthy();
  expect(pkgJson.devDependencies['@rstest/core']).toBeTruthy();
  expect(pkgJson.publishConfig?.access).toBe('public');
};

export interface TemplateCase {
  template: string;
  lang: Lang;
  tools: string[];
  label: string;
}

export const createAndValidate = (
  cwd: string,
  templateCase: TemplateCase,
  {
    name = `test-temp-${templateCase.label}`,
    tools: additionalTools = [],
    clean = true,
  }: {
    name?: string;
    tools?: string[];
    clean?: boolean;
  } = {},
) => {
  const dir = path.join(cwd, name);
  fse.removeSync(dir);

  const templateArg = `${templateCase.template}-${templateCase.lang}`;

  let command = `node ../dist/index.js --dir ${name} --template ${templateArg}`;

  if (templateCase.tools.length) {
    const templateToolsCmd = templateCase.tools
      .map((tool) => `--tools ${tool}`)
      .join(' ');
    command += ` ${templateToolsCmd}`;
  }

  if (additionalTools.length) {
    const toolsCmd = additionalTools.map((tool) => `--tools ${tool}`).join(' ');
    command += ` ${toolsCmd}`;
  }

  execSync(command, { cwd });

  const pkgJson = fse.readJSONSync(path.join(dir, 'package.json'));
  expectPackageJson(
    pkgJson,
    path.basename(name),
    templateCase.template,
    templateCase.lang,
  );

  // tsconfig
  if (templateCase.lang === 'ts') {
    expect(pkgJson.devDependencies.typescript).toBeTruthy();
    expect(existsSync(path.join(dir, 'tsconfig.json'))).toBeTruthy();
  }

  if (
    templateCase.lang === 'ts' &&
    (templateCase.template === 'react' || templateCase.template === 'vue')
  ) {
    const envDtsPath = path.join(dir, 'src/env.d.ts');
    expect(existsSync(envDtsPath)).toBeTruthy();
    expect(fse.readFileSync(envDtsPath, 'utf-8').trimEnd()).toBe(
      '/// <reference types="@rslib/core/types" />',
    );
  }

  expect(
    existsSync(path.join(dir, `rstest.config.${templateCase.lang}`)),
  ).toBeTruthy();
  expect(existsSync(path.join(dir, 'tests'))).toBeTruthy();
  expect(
    fse
      .readdirSync(path.join(dir, 'tests'))
      .some((file) => file.startsWith('index.test.')),
  ).toBe(true);

  // tool - Storybook
  if (templateCase.tools.includes('storybook')) {
    for (const file of [
      `.storybook/main.${templateCase.lang}`,
      `.storybook/preview.${templateCase.lang}`,
    ]) {
      expect(existsSync(path.join(dir, file))).toBeTruthy();
    }

    const storybookDeps = ['storybook', 'storybook-addon-rslib'];
    if (templateCase.template === 'react') {
      storybookDeps.push('storybook-react-rsbuild');
    } else if (templateCase.template === 'vue') {
      storybookDeps.push('storybook-vue3-rsbuild');
    }

    for (const dep of storybookDeps) {
      expect(pkgJson.devDependencies[dep]).toBeTruthy();
    }
  }

  if (templateCase.template === 'svelte') {
    expect(pkgJson.devDependencies['@rsbuild/plugin-svelte']).toBeTruthy();
    expect(pkgJson.devDependencies.svelte).toBeTruthy();
    expect(pkgJson.peerDependencies.svelte).toBe('^5.0.0');

    if (templateCase.lang === 'ts') {
      expect(pkgJson.devDependencies['svelte-check']).toBeTruthy();
      expect(pkgJson.devDependencies.svelte2tsx).toBeTruthy();
      expect(pkgJson.scripts.check).toBe('svelte-check');
      expect(
        existsSync(path.join(dir, 'scripts/rslib-plugin-svelte-dts.ts')),
      ).toBeTruthy();
      expect(pkgJson.exports['.'].types).toBe('./dist/index.d.ts');
      expect(pkgJson.types).toBe('./dist/index.d.ts');
    } else {
      expect(pkgJson.devDependencies['svelte-check']).toBeFalsy();
      expect(pkgJson.devDependencies.svelte2tsx).toBeFalsy();
      expect(pkgJson.scripts.check).toBeFalsy();
      expect(
        existsSync(path.join(dir, 'scripts/rslib-plugin-svelte-dts.ts')),
      ).toBeFalsy();
      expect(pkgJson.exports['.'].types).toBeFalsy();
      expect(pkgJson.types).toBeFalsy();
    }
  }

  if (templateCase.template === 'react') {
    const configFile = path.join(
      dir,
      templateCase.lang === 'ts' ? 'rslib.config.ts' : 'rslib.config.js',
    );
    const configContent = fse.readFileSync(configFile, 'utf-8');

    expect(pkgJson.devDependencies['@testing-library/dom']).toBeTruthy();
    expect(pkgJson.devDependencies['@types/react-dom']).toBeTruthy();
    expect(pkgJson.devDependencies['react-dom']).toBeTruthy();

    if (templateCase.tools.includes('react-compiler')) {
      expect(configContent).toContain('reactCompiler');
      expect(pkgJson.peerDependencies.react).toBe('>=19.0.0');
      expect(pkgJson.peerDependencies['react-dom']).toBe('>=19.0.0');
    } else {
      expect(configContent).not.toContain('reactCompiler');
      expect(pkgJson.peerDependencies.react).toBe('>=18.0.0');
      expect(pkgJson.peerDependencies['react-dom']).toBe('>=18.0.0');
    }
  }

  const cleanFn = () => fse.removeSync(dir);
  if (clean) {
    cleanFn();
  }

  return { dir, pkgJson, clean: cleanFn };
};
