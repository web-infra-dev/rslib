import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';
import { expect } from 'vitest';

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

  if (template.endsWith('-ts')) {
    expect(pkgJson.devDependencies.typescript).toBeTruthy();
    expect(existsSync(path.join(dir, 'tsconfig.json'))).toBeTruthy();
  }

  const cleanFn = () => fse.removeSync(dir);
  if (clean) {
    cleanFn();
  }

  return { dir, pkgJson, clean: cleanFn };
};
