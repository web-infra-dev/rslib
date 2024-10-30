import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';
import { expect } from 'vitest';

export const decomposeTemplateName = (
  name: string,
): {
  template: string;
  tools: string[];
  lang: string;
} => {
  const [template, tools, lang] = name.split('-');
  const trimBrackets = (str: string) => str.replace(/^\[|\]$/g, '');
  return {
    template: trimBrackets(template)!,
    tools: tools === '[]' ? [] : trimBrackets(tools).split(','),
    lang: lang!,
  } as const;
};

export const expectPackageJson = (
  pkgJson: Record<string, any>,
  name: string,
) => {
  expect(pkgJson.name).toBe(name);
  expect(pkgJson.scripts.dev).toBe('rslib build --watch');
  expect(pkgJson.scripts.build).toBe('rslib build');
  expect(pkgJson.devDependencies['@rslib/core']).toBeTruthy();
};

export const createAndValidate = (
  cwd: string,
  template: string,
  {
    name = `test-temp-${template}`,
    tools = [],
    clean = true,
  }: {
    name?: string;
    tools?: string[];
    clean?: boolean;
  } = {},
) => {
  const dir = path.join(cwd, name);
  fse.removeSync(dir);

  let command = `node ../dist/index.js -d ${name} -t ${template}`;
  if (tools.length) {
    const toolsCmd = tools.map((tool) => `--tools ${tool}`).join(' ');
    command += ` ${toolsCmd}`;
  }

  execSync(command, { cwd });

  const pkgJson = fse.readJSONSync(path.join(dir, 'package.json'));
  expectPackageJson(pkgJson, path.basename(name));

  const templateData = decomposeTemplateName(template);

  // tsconfig
  if (templateData.lang === 'ts') {
    expect(pkgJson.devDependencies.typescript).toBeTruthy();
    expect(existsSync(path.join(dir, 'tsconfig.json'))).toBeTruthy();
  }

  // tool - Vitest
  if (templateData.tools.includes('vitest')) {
    for (const file of [
      `vitest.config.${templateData.lang}`,
      `tests/index.test.${templateData.lang}${templateData.template === 'react' ? 'x' : ''}`,
    ]) {
      expect(existsSync(path.join(dir, file))).toBeTruthy();
    }
    expect(pkgJson.devDependencies.vitest).toBeTruthy();
    if (templateData.template === 'react') {
      expect(pkgJson.devDependencies['@testing-library/react']).toBeTruthy();
    }
  }

  // tool - Storybook
  if (templateData.tools.includes('storybook')) {
    for (const file of [
      `.storybook/main.${templateData.lang}`,
      `.storybook/preview.${templateData.lang}`,
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
