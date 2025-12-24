import { join } from 'node:path';
import { createRslib } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';
import fse from 'fs-extra';
import { expectFile } from 'test-helper';

describe('rslib.inspectConfig', async () => {
  test('return Rsbuild and Rspack config', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        logLevel: 'silent',
      },
    });
    const { rslibConfig, rsbuildConfig, bundlerConfigs } =
      await rslib.inspectConfig();

    expect(rslibConfig).not.toBeUndefined();
    expect(rsbuildConfig).not.toBeUndefined();
    expect(bundlerConfigs).not.toBeUndefined();
  });

  test('should write to disk correctly', async () => {
    const distPath = join(import.meta.dirname, './dist-write-to-disk');
    await fse.remove(distPath);

    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        output: {
          distPath,
        },
        logLevel: 'silent',
      },
    });

    await rslib.inspectConfig({
      writeToDisk: true,
    });

    await expectFile(join(distPath, '.rsbuild/rslib.config.mjs'));

    await expectFile(join(distPath, '.rsbuild/rsbuild.config.mjs'));
  });

  test('should write to custom output path correctly', async () => {
    const distPath = join(import.meta.dirname, './dist-custom');
    await fse.remove(distPath);

    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        logLevel: 'silent',
      },
    });

    await rslib.inspectConfig({
      writeToDisk: true,
      outputPath: distPath,
    });

    await expectFile(join(distPath, 'rslib.config.mjs'));

    await expectFile(join(distPath, 'rsbuild.config.mjs'));
  });

  test('return Rsbuild and Rspack config of specific lib id', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
          {
            format: 'cjs',
          },
        ],
        logLevel: 'silent',
      },
    });

    const result1 = await rslib.inspectConfig({
      lib: ['cjs'],
    });

    expect(result1.rslibConfig).not.toBeUndefined();
    expect(result1.environmentConfigs.length).toBe(1);
    expect(result1.bundlerConfigs.length).toBe(1);

    const result2 = await rslib.inspectConfig({
      lib: ['esm', 'cjs'],
    });

    expect(result2.rslibConfig).not.toBeUndefined();
    expect(result2.environmentConfigs.length).toBe(2);
    expect(result2.bundlerConfigs.length).toBe(2);
  });
});

describe('rslib.getRslibConfig', async () => {
  test('returns the resolved Rslib configuration', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
          {
            format: 'cjs',
          },
        ],
        logLevel: 'silent',
      },
    });

    const config = rslib.getRslibConfig();

    expect(config).not.toBeUndefined();
    expect(config.lib).toHaveLength(2);
    expect(config.lib![0]?.format).toBe('esm');
    expect(config.lib![1]?.format).toBe('cjs');
    expect(config.root).toMatchInlineSnapshot(
      `"<ROOT>/tests/integration/javascript-api/inspect-config"`,
    );
  });
});
