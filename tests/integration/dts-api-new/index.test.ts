import { createRslib, loadConfig } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { buildAndGetResults, rslibBuild } from 'test-helper';

describe('TypeScript 7.1 stable JavaScript API', () => {
  const fixturePath = join(__dirname, 'basic');

  test('emits declarations, maps, aliases, extensions, banners and bundles', async () => {
    const { contents } = await buildAndGetResults({ fixturePath, type: 'dts' });
    const output = Object.values(contents).flatMap((files) =>
      Object.entries(files),
    );
    const declarations = output.filter(([file]) =>
      /\.d\.(ts|mts|cts)$/.test(file),
    );
    expect(declarations.length).toBe(5);
    for (const [, content] of declarations) {
      expect(content).toContain('// declaration banner');
      expect(content).toContain('// declaration footer');
      expect(content).not.toContain('@utils');
    }
    expect(
      output.some(
        ([file, content]) =>
          file.endsWith('index.d.cts') && content.includes('./utils.cjs'),
      ),
    ).toBe(true);
    expect(
      output.some(
        ([file, content]) =>
          file.endsWith('esm/index.d.ts') && content.includes('./utils.js'),
      ),
    ).toBe(true);
    const maps = output.filter(([file]) => file.endsWith('.map'));
    expect(maps.length).toBe(4);
    for (const [file, content] of maps) {
      expect(JSON.parse(content).file).toBe(
        file
          .split('/')
          .pop()!
          .replace(/\.map$/, ''),
      );
    }
    expect(
      output.some(
        ([file, content]) =>
          file.endsWith('bundled/index.d.ts') &&
          content.includes('declare const add'),
      ),
    ).toBe(true);
  });

  test('reports type errors and respects abortOnError', async () => {
    const errorFile = join(fixturePath, 'src/error.ts');
    await fs.writeFile(errorFile, 'export const invalid: number = "invalid";');
    try {
      await expect(
        rslibBuild({ cwd: fixturePath, lib: ['esm'] }),
      ).rejects.toThrow('declaration files generation');
      await expect(
        rslibBuild({
          cwd: fixturePath,
          lib: ['esm'],
          modifyConfig(config) {
            for (const lib of config.lib!) {
              lib.dts = { ...(lib.dts as object), abortOnError: false };
            }
          },
        }),
      ).resolves.toBeDefined();
    } finally {
      await fs.rm(errorFile);
    }
  });

  test('rebuilds declarations in watch mode', async () => {
    const loadedConfig = await loadConfig({ cwd: fixturePath });
    const rslib = await createRslib({ cwd: fixturePath, config: loadedConfig });
    const sourceFile = join(fixturePath, 'src/utils.ts');
    const original = await fs.readFile(sourceFile, 'utf8');
    const declarationFile = join(fixturePath, 'dist/esm/utils.d.ts');
    await fs.rm(join(fixturePath, 'dist/esm'), {
      recursive: true,
      force: true,
    });
    const result = await rslib.build({ watch: true, lib: ['esm'] });
    try {
      await expect
        .poll(() => fs.readFile(declarationFile, 'utf8').catch(() => ''))
        .toContain('=> number');
      await fs.writeFile(
        sourceFile,
        'export const add = (a: number, b: number): string => String(a + b);',
      );
      await expect
        .poll(() => fs.readFile(declarationFile, 'utf8').catch(() => ''), {
          timeout: 10_000,
        })
        .toContain('=> string');
    } finally {
      await result.close();
      await fs.writeFile(sourceFile, original);
    }
  });

  test('supports composite projects without the unstable incremental API', async () => {
    const configFile = join(fixturePath, 'tsconfig.json');
    const original = await fs.readFile(configFile, 'utf8');
    const config = JSON.parse(original);
    config.compilerOptions.composite = true;
    try {
      await fs.writeFile(configFile, JSON.stringify(config));
      const { buildResult } = await rslibBuild({
        cwd: fixturePath,
        lib: ['esm'],
      });
      await buildResult.close();
      expect(
        await fs.readFile(join(fixturePath, 'dist/esm/utils.d.ts'), 'utf8'),
      ).toContain('=> number');
    } finally {
      await fs.writeFile(configFile, original);
    }
  });

  test('uses the executable for build mode and builds project references', async () => {
    const buildPath = join(__dirname, 'build');
    const referenceOutput = join(__dirname, 'reference/dist/index.d.ts');
    await fs.rm(join(__dirname, 'reference/dist'), {
      recursive: true,
      force: true,
    });
    const { buildResult } = await rslibBuild({ cwd: buildPath });
    await buildResult.close();
    expect(
      await fs.readFile(join(buildPath, 'dist/index.d.ts'), 'utf8'),
    ).toContain('value = "main"');
    expect(await fs.readFile(referenceOutput, 'utf8')).toContain(
      'referenced = "reference"',
    );
  });

  test('reports config diagnostics from the JavaScript API', async () => {
    const configFile = join(fixturePath, 'tsconfig.json');
    const original = await fs.readFile(configFile, 'utf8');
    const config = JSON.parse(original);
    config.compilerOptions.target = 'invalid';
    try {
      await fs.writeFile(configFile, JSON.stringify(config));
      await expect(
        rslibBuild({ cwd: fixturePath, lib: ['esm'] }),
      ).rejects.toThrow('declaration files generation');
    } finally {
      await fs.writeFile(configFile, original);
    }
  });
});
