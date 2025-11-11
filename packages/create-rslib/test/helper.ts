import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { expect } from '@rstest/core';
import fse from 'fs-extra';
import type { Lang } from '../src/helpers';

export const expectPackageJson = (
  pkgJson: Record<string, any>,
  name: string,
) => {
  expect(pkgJson.name).toBe(name);
  expect(pkgJson.scripts.dev).toBe('rslib build --watch');
  expect(pkgJson.scripts.build).toBe('rslib build');
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
  expectPackageJson(pkgJson, path.basename(name));

  // tsconfig
  if (templateCase.lang === 'ts') {
    expect(pkgJson.devDependencies.typescript).toBeTruthy();
    expect(existsSync(path.join(dir, 'tsconfig.json'))).toBeTruthy();
  }

  // tool - Vitest
  if (templateCase.tools.includes('vitest')) {
    for (const file of [
      `vitest.config.${templateCase.lang}`,
      `tests/index.test.${templateCase.lang}${templateCase.template === 'react' ? 'x' : ''}`,
    ]) {
      expect(existsSync(path.join(dir, file))).toBeTruthy();
    }
    expect(pkgJson.devDependencies.vitest).toBeTruthy();
    if (templateCase.template === 'react') {
      expect(pkgJson.devDependencies['@testing-library/react']).toBeTruthy();
    }
  }

  // tool - Storybook
  if (templateCase.tools.includes('storybook')) {
    for (const file of [
      `.storybook/main.${templateCase.lang}`,
      `.storybook/preview.${templateCase.lang}`,
    ]) {
      expect(existsSync(path.join(dir, file))).toBeTruthy();
    }

    for (const dep of [
      'storybook',
      'storybook-react-rsbuild',
      'storybook-addon-rslib',
    ]) {
      expect(pkgJson.devDependencies[dep]).toBeTruthy();
    }
  }

  const cleanFn = () => fse.removeSync(dir);
  if (clean) {
    cleanFn();
  }

  return { dir, pkgJson, clean: cleanFn };
};
