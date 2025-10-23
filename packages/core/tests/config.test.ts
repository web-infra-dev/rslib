import { join } from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { inspect } from '@rslib/core';
import { describe, expect, rs, test } from '@rstest/core';
import type { BuildOptions } from '../src/cli/commands';
import { initConfig } from '../src/cli/initConfig';
import {
  composeCreateRsbuildConfig,
  composeRsbuildEnvironments,
  loadConfig,
} from '../src/config';
import type { RslibConfig } from '../src/types/config';

rs.mock('rslog');

describe('Should load config file correctly', () => {
  test('Load config.js in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configFilePath = join(fixtureDir, 'rslib.config.js');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.mjs in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configFilePath = join(fixtureDir, 'rslib.config.mjs');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.ts in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configFilePath = join(fixtureDir, 'rslib.config.ts');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.ts',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.cjs with defineConfig in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configFilePath = join(fixtureDir, 'rslib.config.cjs');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.js in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configFilePath = join(fixtureDir, 'rslib.config.js');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.cjs in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configFilePath = join(fixtureDir, 'rslib.config.cjs');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.ts in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configFilePath = join(fixtureDir, 'rslib.config.ts');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.ts',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });

  test('Load config.mjs with defineConfig in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configFilePath = join(fixtureDir, 'rslib.config.mjs');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toMatchObject({
      lib: [],
      source: {
        entry: {
          index: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath,
      },
    });
  });
});

describe('CLI options', () => {
  test('applies build CLI overrides for common flags', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cli-options');
    const configFilePath = join(fixtureDir, 'rslib.config.ts');

    const options: BuildOptions = {
      config: configFilePath,
      entry: ['index=src/main.ts', 'utils=src/utils.ts'],
      distPath: 'build',
      bundle: false,
      syntax: 'es2018',
      target: 'node',
      dts: true,
      externals: ['react', 'react-dom'],
      minify: true,
      clean: true,
      autoExtension: false,
      autoExternal: false,
      tsconfig: 'tsconfig.build.json',
    };

    const { config } = await initConfig(options);
    expect(config).toMatchInlineSnapshot(`
      {
        "_privateMeta": {
          "configFilePath": "<WORKSPACE>/tests/fixtures/config/cli-options/rslib.config.ts",
        },
        "lib": [
          {
            "autoExtension": false,
            "autoExternal": false,
            "bundle": false,
            "dts": true,
            "output": {
              "cleanDistPath": true,
              "distPath": {
                "root": "build",
              },
              "externals": [
                "react",
                "react-dom",
              ],
              "minify": true,
              "target": "node",
            },
            "source": {
              "entry": {
                "index": "src/main.ts",
                "utils": "src/utils.ts",
              },
              "tsconfigPath": "tsconfig.build.json",
            },
            "syntax": "es2018",
          },
        ],
        "source": {
          "define": {},
        },
      }
    `);
  });
});

describe('Should compose create Rsbuild config correctly', () => {
  test('Merge Rsbuild config in each format', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          source: {
            preEntry: './b.js',
          },
          resolve: {
            alias: {
              foo: 'foo/esm',
            },
          },
        },
        {
          format: 'cjs',
          source: {
            preEntry: ['./c.js', './d.js'],
          },
          resolve: {
            alias: {
              bar: 'bar/cjs',
            },
          },
        },
        {
          format: 'umd',
        },
        {
          format: 'iife',
        },
        {
          format: 'mf',
          plugins: [pluginModuleFederation({}, {})],
        },
      ],
      source: {
        preEntry: './a.js',
      },
      root: join(__dirname, '..'),
      resolve: {
        alias: {
          foo: 'foo',
          bar: 'bar',
        },
      },
      output: {
        filenameHash: false,
      },
      tools: {
        rspack: {
          resolve: {
            extensionAlias: {
              '.js': ['.ts', '.tsx'],
            },
          },
        },
      },
      logLevel: 'silent',
    };
    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);
    expect(composedRsbuildConfig).toMatchSnapshot();

    const rsbuildInstance = await inspect(rslibConfig);
    const { rsbuildConfig, bundlerConfigs } =
      await rsbuildInstance.inspectConfig();
    expect(rsbuildConfig).toMatchSnapshot('inspected Rsbuild configs');
    expect(bundlerConfigs).toMatchSnapshot('inspected Rspack configs');
  });

  test('Merge output.distPath correctly', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          output: {
            distPath: 'dist/esm',
          },
        },
        {
          format: 'cjs',
          output: {
            distPath: {
              root: 'dist/cjs',
            },
          },
        },
      ],
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);
    expect(
      composedRsbuildConfig[0]?.config.output?.distPath,
    ).toMatchInlineSnapshot(`
      {
        "css": "./",
        "cssAsync": "./",
        "js": "./",
        "jsAsync": "./",
        "root": "dist/esm",
      }
    `);
    expect(
      composedRsbuildConfig[1]?.config.output?.distPath,
    ).toMatchInlineSnapshot(`
      {
        "css": "./",
        "cssAsync": "./",
        "js": "./",
        "jsAsync": "./",
        "root": "dist/cjs",
      }
    `);
  });
});

describe('syntax', () => {
  test('`syntax` default value', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
        },
      ],
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(
      composedRsbuildConfig[0]!.config.output?.overrideBrowserslist,
    ).toMatchInlineSnapshot(`
      [
        "last 1 node versions",
      ]
    `);
  });

  test('`syntax` default value should determined by target `web`', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
        },
      ],
      output: {
        target: 'web',
      },
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(
      composedRsbuildConfig[0]!.config.output?.overrideBrowserslist,
    ).toMatchInlineSnapshot(`
      [
        "last 1 Chrome versions",
        "last 1 Firefox versions",
        "last 1 Edge versions",
        "last 1 Safari versions",
        "last 1 ios_saf versions",
        "not dead",
      ]
    `);
  });

  test('`syntax` default value should determined by target `node`', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
        },
      ],
      output: {
        target: 'node',
      },
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(
      composedRsbuildConfig[0]!.config.output?.overrideBrowserslist,
    ).toMatchInlineSnapshot(`
      [
        "last 1 node versions",
      ]
    `);
  });

  test('`syntax` could accept `esX` and transform to browserslist', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          syntax: 'es2015',
          format: 'esm',
        },
      ],
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(
      composedRsbuildConfig[0]!.config.output?.overrideBrowserslist,
    ).toMatchInlineSnapshot(`
      [
        "chrome >= 51",
        "edge >= 79",
        "firefox >= 53",
        "ios >= 16.3",
        "node >= 6.5",
        "safari >= 16.3",
      ]
    `);
  });
});

describe('minify', () => {
  test('`minify` default value', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
        },
      ],
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(
      composedRsbuildConfig[0]!.config.output?.minify,
    ).toMatchInlineSnapshot(`
      {
        "css": false,
        "js": true,
        "jsOptions": {
          "minimizerOptions": {
            "compress": {
              "dead_code": true,
              "defaults": false,
              "toplevel": true,
              "unused": true,
            },
            "format": {
              "comments": "some",
              "preserve_annotations": true,
            },
            "mangle": false,
            "minify": false,
          },
          "test": /\\\\\\.\\[cm\\]\\?jsx\\?\\(\\\\\\?\\.\\*\\)\\?\\$/,
        },
      }
    `);
  });

  test('`minify` is configured by user', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          output: {
            minify: false,
          },
        },
        {
          format: 'esm',
          output: {
            minify: true,
          },
        },
        {
          format: 'esm',
          output: {
            minify: {
              js: false,
              css: true,
            },
          },
        },
      ],
      output: {
        target: 'web',
      },
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(
      composedRsbuildConfig[0]!.config.output?.minify,
    ).toMatchInlineSnapshot('false');

    expect(
      composedRsbuildConfig[1]!.config.output?.minify,
    ).toMatchInlineSnapshot('true');

    expect(
      composedRsbuildConfig[2]!.config.output?.minify,
    ).toMatchInlineSnapshot(`
      {
        "css": true,
        "js": false,
      }
    `);
  });
});

describe('id', () => {
  test('default id logic', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
        },
        {
          format: 'cjs',
        },
        {
          format: 'esm',
        },
        {
          format: 'umd',
        },
        {
          format: 'esm',
        },
      ],
    };

    const { environments: composedRsbuildConfig } =
      await composeRsbuildEnvironments(rslibConfig);

    expect(Object.keys(composedRsbuildConfig)).toMatchInlineSnapshot(`
      [
        "esm0",
        "cjs",
        "esm1",
        "umd",
        "esm2",
      ]
    `);
  });

  test('with user specified id', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          id: 'esm1',
          format: 'esm',
        },
        {
          format: 'cjs',
        },
        {
          format: 'esm',
        },
        {
          id: 'cjs',
          format: 'umd',
        },
        {
          id: 'esm0',
          format: 'esm',
        },
      ],
    };

    const { environments: composedRsbuildConfig } =
      await composeRsbuildEnvironments(rslibConfig);
    expect(Object.keys(composedRsbuildConfig)).toMatchInlineSnapshot(`
      [
        "esm1",
        "cjs1",
        "esm2",
        "cjs",
        "esm0",
      ]
    `);
  });

  test('do not allow conflicted id', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          id: 'a',
          format: 'esm',
        },
        {
          format: 'cjs',
        },
        {
          format: 'esm',
        },
        {
          id: 'a',
          format: 'umd',
        },
        {
          id: 'b',
          format: 'esm',
        },
        {
          id: 'b',
          format: 'esm',
        },
      ],
    };

    await expect(() =>
      composeRsbuildEnvironments(rslibConfig),
    ).rejects.toThrowError(
      'The following ids are duplicated: "a", "b". Please change the "lib.id" to be unique.',
    );
  });
});
