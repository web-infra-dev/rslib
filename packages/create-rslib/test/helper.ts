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
  expect(pkgJson.scripts.dev).toBe('rslib build --watch');
  // Vue TS template has additional vue-tsc check
  if (template === 'vue' && lang === 'ts') {
    expect(pkgJson.scripts.build).toBe('rslib build && vue-tsc');
  } else {
    expect(pkgJson.scripts.build).toBe('rslib build');
  }
  expect(pkgJson.devDependencies['@rslib/core']).toBeTruthy();
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

  const cleanFn = () => fse.removeSync(dir);
  if (clean) {
    cleanFn();
  }

  return { dir, pkgJson, clean: cleanFn };
};
