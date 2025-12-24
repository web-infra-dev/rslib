import { join } from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { describe, expect, rs, test } from '@rstest/core';
import type { BuildOptions } from '../src/cli/commands';
import { init } from '../src/cli/init';
import {
  composeCreateRsbuildConfig,
  composeRsbuildEnvironments,
} from '../src/config';
import { createRslib } from '../src/createRslib';
import { loadConfig } from '../src/loadConfig';
import {
  mergeRslibConfig,
  type RslibConfigWithOptionalLib,
} from '../src/mergeConfig';
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

describe('Should merge Rslib config correctly', () => {
  test('merge different libs and globals configuration', async () => {
    const config1: RslibConfig = {
      lib: [
        {
          format: 'esm',
          syntax: 'es2020',
          output: {
            externals: ['react'],
          },
        },
        {
          format: 'esm',
          syntax: 'es6',
        },
      ],
      output: {
        target: 'node',
      },
      source: {
        define: {
          __DEV__: 'true',
          FOO: '"a"',
        },
      },
    };

    const config2: RslibConfig = {
      lib: [
        {
          format: 'cjs',
          syntax: 'es2018',
          output: {
            externals: ['vue'],
          },
        },
      ],
      output: {
        target: 'web',
      },
      source: {
        define: {
          FOO: '"b"',
          BAR: '"c"',
        },
      },
    };

    const merged = mergeRslibConfig(config1, config2);

    expect(merged).toMatchInlineSnapshot(`
      {
        "lib": [
          {
            "format": "esm",
            "output": {
              "externals": [
                "react",
              ],
            },
            "syntax": "es2020",
          },
          {
            "format": "esm",
            "syntax": "es6",
          },
          {
            "format": "cjs",
            "output": {
              "externals": [
                "vue",
              ],
            },
            "syntax": "es2018",
          },
        ],
        "output": {
          "target": "web",
        },
        "source": {
          "define": {
            "BAR": ""c"",
            "FOO": ""b"",
            "__DEV__": "true",
          },
        },
      }
    `);
  });

  test('merge without lib field', async () => {
    const config1: RslibConfig = {
      lib: [
        {
          format: 'esm',
        },
      ],
      output: {
        target: 'node',
      },
    };

    const config2: RslibConfigWithOptionalLib = {
      output: {
        target: 'web',
      },
    };

    const merged = mergeRslibConfig(config1, config2);

    expect(merged).toMatchInlineSnapshot(`
      {
        "lib": [
          {
            "format": "esm",
          },
        ],
        "output": {
          "target": "web",
        },
      }
    `);
  });
});

describe('CLI options', () => {
  test('applies build CLI overrides for common flags', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cli-options');
    const configFilePath = join(fixtureDir, 'rslib.config.ts');

    const options: BuildOptions = {
      root: join(__dirname, '..'),
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

    const rslib = await init(options);
    const { config } = rslib.context;
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
        "root": "<WORKSPACE>",
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
    const formats = ['esm', 'cjs', 'umd', 'iife', 'mf'];
    composedRsbuildConfig.forEach((bundlerConfig, index) => {
      expect(bundlerConfig).toMatchSnapshot(
        `rsbuild config - ${index} ${formats[index]}`,
      );
    });

    const rslib = await createRslib({
      config: rslibConfig,
    });
    const { rsbuildConfig, bundlerConfigs } = await rslib.inspectConfig();

    expect(rsbuildConfig).toMatchSnapshot('inspected Rsbuild configs');

    bundlerConfigs.forEach((bundlerConfig, index) => {
      expect(bundlerConfig).toMatchSnapshot(
        `inspected Rspack config - ${index} ${formats[index]}`,
      );
    });
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

  test('Enable experiment.advancedEsm in esm format', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          experiments: {
            advancedEsm: true,
          },
        },
      ],
      root: join(__dirname, '..'),
    };

    const rslib = await createRslib({
      config: rslibConfig,
    });
    const inspectConfigResult = await rslib.inspectConfig();
    const { bundlerConfigs } = inspectConfigResult;
    expect(bundlerConfigs).toMatchSnapshot(
      'experiment.advancedEsm Rspack configs',
    );
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
              "directives": false,
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
