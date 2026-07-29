import { join } from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginSass } from '@rsbuild/plugin-sass';
import { createRslib } from '@rslib/core';
import { afterEach, describe, expect, test } from '@rstest/core';
import fse from 'fs-extra';
import { expectFile } from 'test-helper';

describe('rslib.inspectConfig', async () => {
  const initialNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (initialNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = initialNodeEnv;
    }
  });

  const createModeRslib = () => {
    return createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'mf',
            plugins: [
              pluginModuleFederation({
                name: 'inspect-mode',
              }),
            ],
          },
          {
            format: 'umd',
            umdName: 'InspectMode',
          },
        ],
        logLevel: 'silent',
      },
    });
  };

  test('should apply production mode before composing configs', async () => {
    process.env.NODE_ENV = 'development';

    const rslib = await createModeRslib();
    const result = await rslib.inspectConfig({
      lib: ['umd'],
      mode: 'production',
    });

    expect(process.env.NODE_ENV).toBe('production');
    expect(result.origin.rsbuildConfig.mode).toBe('production');
    expect(Object.keys(result.origin.environmentConfigs)).toEqual(['umd']);
    expect(result.origin.bundlerConfigs).toHaveLength(1);
    expect(result.origin.bundlerConfigs[0]!.mode).toBe('production');
    expect(result.origin.bundlerConfigs[0]!.optimization?.nodeEnv).toBe(
      'production',
    );
  });

  test('should infer development mode from NODE_ENV', async () => {
    process.env.NODE_ENV = 'development';

    const rslib = await createModeRslib();
    const result = await rslib.inspectConfig();

    expect(result.origin.rsbuildConfig.mode).toBe('development');
    expect(Object.keys(result.origin.environmentConfigs)).toEqual(['mf']);
  });

  test('should inspect only MF configs in development mode', async () => {
    const rslib = await createModeRslib();
    const result = await rslib.inspectConfig({
      mode: 'development',
    });

    expect(process.env.NODE_ENV).toBe('development');
    expect(result.origin.rsbuildConfig.mode).toBe('development');
    expect(Object.keys(result.origin.environmentConfigs)).toEqual(['mf']);
    expect(result.origin.bundlerConfigs).toHaveLength(1);
    expect(result.origin.bundlerConfigs[0]!.name).toBe('mf');
    expect(result.origin.bundlerConfigs[0]!.mode).toBe('development');
    expect(result.origin.bundlerConfigs[0]!.optimization?.nodeEnv).toBe(
      'development',
    );
  });

  test('should reject unsupported inspect modes', async () => {
    const rslib = await createModeRslib();

    await expect(
      rslib.inspectConfig({
        // @ts-expect-error testing runtime validation for JavaScript callers
        mode: 'none',
      }),
    ).rejects.toThrow(
      'Invalid inspect mode "none". Expected "development" or "production".',
    );
  });

  test('should inspect all configs in production mode by default', async () => {
    const rslib = await createModeRslib();
    const { rslibConfig, rsbuildConfig, bundlerConfigs, origin } =
      await rslib.inspectConfig();

    expect(rslibConfig).not.toBeUndefined();
    expect(rsbuildConfig).not.toBeUndefined();
    expect(bundlerConfigs).not.toBeUndefined();
    expect(origin.rsbuildConfig.mode).toBe('production');
    expect(Object.keys(origin.environmentConfigs)).toEqual(['mf', 'umd']);
    expect(origin.bundlerConfigs).toHaveLength(2);
    expect(
      origin.bundlerConfigs.every((config) => config.mode === 'production'),
    ).toBe(true);
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

  test('should inspect numbered sass rules in bundleless config', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
            bundle: false,
          },
        ],
        plugins: [
          pluginSass({ include: /\.module\.scss$/ }),
          pluginSass({ include: /\.scss$/ }),
        ],
        output: {
          target: 'web',
        },
        logLevel: 'silent',
      },
    });

    const { bundlerConfigs } = await rslib.inspectConfig();
    const matches = Array.from(
      bundlerConfigs[0]!.matchAll(
        /config\.module\.rule\('(sass(?:-\d+)?)'\)\.oneOf\('sass'\)\.use\('mini-css-extract'\)[\s\S]*?loader: '([^']*libCssExtractLoader\.js)'/g,
      ),
      ([, ruleId, loader]) => ({
        ruleId,
        loader,
      }),
    );

    expect(matches).toMatchInlineSnapshot(`
      [
        {
          "loader": "<ROOT>/packages/core/dist/libCssExtractLoader.js",
          "ruleId": "sass",
        },
        {
          "loader": "<ROOT>/packages/core/dist/libCssExtractLoader.js",
          "ruleId": "sass-1",
        },
      ]
    `);
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
