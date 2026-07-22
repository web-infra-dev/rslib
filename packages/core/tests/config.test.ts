import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import type { RsbuildPlugin } from '@rsbuild/core';
import { describe, expect, rs, test } from '@rstest/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { BuildOptions } from '../src/cli/commands';
import { init, initCliAction } from '../src/cli/init';
import {
  composeCreateRsbuildConfig,
  composeRsbuildEnvironments,
} from '../src/config';
import { createRslib } from '../src/createRslib';
import { loadConfig } from '../src/loadConfig';
import { mergeRslibConfig } from '../src/mergeConfig';
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
        configFileDependencies: [],
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
        configFileDependencies: [],
        configFilePath,
      },
    });
  });

  test('Load config.mts in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configFilePath = join(fixtureDir, 'rslib.config.mts');
    const { content: config } = await loadConfig({ path: configFilePath });
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          index: './foo/index.ts',
        },
      },
      _privateMeta: {
        configFileDependencies: [],
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
        configFileDependencies: [],
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
        configFileDependencies: [],
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
        configFileDependencies: [],
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
        configFileDependencies: [],
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

  test('passes command to config function', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/command');
    const { content: config } = await loadConfig({
      cwd: fixtureDir,
      command: 'build',
    });

    expect(config.source?.define).toEqual({
      COMMAND: JSON.stringify('build'),
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
            externals: ['pkg1'],
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
            externals: ['pkg2'],
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
                "pkg1",
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
                "pkg2",
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

    const config2: RslibConfig = {
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

  test('merge libs with same id', async () => {
    const config1: RslibConfig = {
      lib: [
        {
          format: 'iife',
        },
        {
          id: 'esm',
          format: 'esm',
          syntax: 'es2020',
          resolve: {
            alias: {
              A: 'a',
            },
          },
          output: {
            externals: ['pkg1'],
          },
        },
        {
          id: 'cjs',
          format: 'cjs',
        },
      ],
    };

    const config2: RslibConfig = {
      lib: [
        {
          id: 'esm',
          syntax: 'es2021',
          output: {
            externals: ['pkg2'],
          },
          resolve: {
            alias: {
              B: 'b',
            },
          },
        },
        {
          format: 'umd',
        },
      ],
    };

    const merged = mergeRslibConfig(config1, config2);

    expect(merged).toMatchInlineSnapshot(`
      {
        "lib": [
          {
            "format": "esm",
            "id": "esm",
            "output": {
              "externals": [
                "pkg1",
                "pkg2",
              ],
            },
            "resolve": {
              "alias": {
                "A": "a",
                "B": "b",
              },
            },
            "syntax": "es2021",
          },
          {
            "format": "cjs",
            "id": "cjs",
          },
          {
            "format": "iife",
          },
          {
            "format": "umd",
          },
        ],
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

    const originalNodeEnv = process.env.NODE_ENV;
    try {
      initCliAction('build', options);
      const rslib = await init();
      const config = rslib.getRslibConfig();
      expect(config).toMatchInlineSnapshot(`
      {
        "_privateMeta": {
          "configFileDependencies": [],
          "configFilePath": "<WORKSPACE>/tests/fixtures/config/cli-options/rslib.config.ts",
        },
        "lib": [
          {
            "autoExtension": false,
            "autoExternal": true,
            "bundle": false,
            "dts": true,
            "output": {
              "autoExternal": false,
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
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  });
});

describe('Should compose create Rsbuild config correctly', () => {
  test('treats omitted lib field as default library config', async () => {
    const rslibConfig: RslibConfig = {
      root: join(__dirname, '..'),
    };

    const composedRsbuildConfig = await composeRsbuildEnvironments(rslibConfig);

    expect(Object.keys(composedRsbuildConfig.environments))
      .toMatchInlineSnapshot(`
      [
        "esm",
      ]
    `);
    expect(composedRsbuildConfig.environmentWithInfos[0]?.format).toBe('esm');
  });

  test('does not treat null lib field as default library config', async () => {
    const rslibConfig = {
      lib: null,
    } as unknown as RslibConfig;

    await expect(composeCreateRsbuildConfig(rslibConfig)).rejects.toThrow();
  });

  test('Merge Rsbuild config in each format', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          syntax: 'esnext',
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
          syntax: 'esnext',
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
          syntax: 'esnext',
        },
        {
          format: 'iife',
          syntax: 'esnext',
        },
        {
          format: 'mf',
          syntax: 'esnext',
          plugins: [
            pluginModuleFederation(
              {
                name: 'test-mf',
              },
              {},
            ),
          ],
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

  test('infers and suffixes chunkFilename from string filenames', async () => {
    const rslib = await createRslib({
      config: {
        root: join(__dirname, '..'),
        source: {
          entry: {
            index: './src/index.ts',
          },
        },
        lib: [
          { output: { filename: { js: '[name].js' } } },
          { output: { filename: { js: '[name].js' } } },
          { output: { filename: { js: 'assets/file.js?asset=/x' } } },
          { output: { filename: { js: '[contenthash:10].js' } } },
        ],
      },
    });
    const {
      origin: { bundlerConfigs },
    } = await rslib.inspectConfig({ verbose: true });

    expect(
      bundlerConfigs.map((config) => config.output?.chunkFilename),
    ).toEqual([
      '[name]~0.js',
      '[name]~1.js',
      'assets/[id]~2.file.js?asset=/x',
      '[id]~3.[contenthash:10].js',
    ]);
  });

  test('does not override chunkFilename for filename functions', async () => {
    const filename = () => '[name].js';
    const rslibConfig: RslibConfig = {
      root: join(__dirname, '..'),
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      lib: [
        { output: { filename: { js: filename } } },
        { output: { filename: { js: filename } } },
      ],
    };

    const composedRsbuildConfigs =
      await composeCreateRsbuildConfig(rslibConfig);
    expect(
      composedRsbuildConfigs.map(({ config }) => config.output?.filename?.js),
    ).toEqual([filename, filename]);
    for (const { config } of composedRsbuildConfigs) {
      const rspackConfigs = Array.isArray(config.tools?.rspack)
        ? config.tools.rspack
        : [config.tools?.rspack];
      expect(
        rspackConfigs.some(
          (rspackConfig) =>
            typeof rspackConfig === 'object' &&
            rspackConfig.output !== undefined &&
            Object.prototype.hasOwnProperty.call(
              rspackConfig.output,
              'chunkFilename',
            ),
        ),
      ).toBe(false);
    }

    const rslib = await createRslib({ config: rslibConfig });
    const {
      origin: { bundlerConfigs },
    } = await rslib.inspectConfig({ verbose: true });

    expect(
      bundlerConfigs.map((config) => typeof config.output?.filename),
    ).toEqual(['function', 'function']);
    expect(
      bundlerConfigs.map((config) => config.output?.chunkFilename),
    ).toEqual([expect.any(Function), expect.any(Function)]);
  });

  test('includes wasm files in bundleless outBase inference', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rslib-wasm-out-base-'));

    try {
      await mkdir(join(root, 'src/lib'), { recursive: true });
      await mkdir(join(root, 'src/wasm'), { recursive: true });
      await writeFile(join(root, 'src/lib/index.js'), '');
      await writeFile(join(root, 'src/wasm/add.wasm'), '');

      const rslib = await createRslib({
        config: {
          root,
          lib: [{ bundle: false, wasm: { mode: 'preserve' } }],
        },
      });
      const {
        origin: { bundlerConfigs },
      } = await rslib.inspectConfig({ verbose: true });
      const entry = bundlerConfigs[0]!.entry;

      expect(entry).toBeTypeOf('function');
      if (typeof entry !== 'function') {
        throw new Error('Expected bundleless entry to be a function');
      }
      await expect(entry()).resolves.toEqual({
        'lib/index': join(root, 'src/lib/index.js'),
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
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
    expect(composedRsbuildConfig[0]?.config.output?.distPath)
      .toMatchInlineSnapshot(`
      {
        "css": "./",
        "cssAsync": "./",
        "js": "./",
        "jsAsync": "./",
        "root": "dist/esm",
      }
    `);
    expect(composedRsbuildConfig[1]?.config.output?.distPath)
      .toMatchInlineSnapshot(`
      {
        "css": "./",
        "cssAsync": "./",
        "js": "./",
        "jsAsync": "./",
        "root": "dist/cjs",
      }
    `);
  });

  test('per-lib deprecated autoExternal should override shared output.autoExternal', async () => {
    const rslibConfig: RslibConfig = {
      output: {
        autoExternal: false,
      },
      lib: [
        {
          format: 'esm',
          autoExternal: true,
        },
      ],
    };

    const [config] = await composeCreateRsbuildConfig(rslibConfig);

    expect(config?.config.output?.autoExternal).toBe(true);
  });

  test('output.autoExternal should override deprecated autoExternal in the same config', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          autoExternal: true,
          output: {
            autoExternal: false,
          },
        },
      ],
    };

    const [config] = await composeCreateRsbuildConfig(rslibConfig);

    expect(config?.config.output?.autoExternal).toBe(false);
  });
});

describe('syntax', () => {
  test('`syntax` default value', async () => {
    const rslibConfig: RslibConfig = {
      root: join(__dirname, 'fixtures/config/esm'),
      lib: [
        {
          format: 'esm',
        },
      ],
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(composedRsbuildConfig[0]!.config.output?.overrideBrowserslist)
      .toMatchInlineSnapshot(`
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

    expect(composedRsbuildConfig[0]!.config.output?.overrideBrowserslist)
      .toMatchInlineSnapshot(`
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
      root: join(__dirname, 'fixtures/config/esm'),
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

    expect(composedRsbuildConfig[0]!.config.output?.overrideBrowserslist)
      .toMatchInlineSnapshot(`
      [
        "last 1 node versions",
      ]
    `);
  });

  test('`syntax` default value should be inferred from engines.node for node target', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rslib-engines-node-'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        engines: {
          node: '^20.19.0 || >=22.12.0',
        },
      }),
    );

    const rslibConfig: RslibConfig = {
      root,
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
    ).toEqual(['node >= 20.19.0']);
  });

  test('explicit `syntax` should take precedence over engines.node', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rslib-engines-node-'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        engines: {
          node: '^20.19.0 || >=22.12.0',
        },
      }),
    );

    const rslibConfig: RslibConfig = {
      root,
      lib: [
        {
          syntax: 'es2015',
          format: 'esm',
        },
      ],
      output: {
        target: 'node',
      },
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);

    expect(composedRsbuildConfig[0]!.config.output?.overrideBrowserslist)
      .toMatchInlineSnapshot(`
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

    expect(composedRsbuildConfig[0]!.config.output?.overrideBrowserslist)
      .toMatchInlineSnapshot(`
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

describe('module ids', () => {
  test('uses target-specific module ids by default', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {},
        {
          output: {
            target: 'web',
          },
        },
      ],
    };

    const rslib = await createRslib({
      config: rslibConfig,
    });
    const { origin } = await rslib.inspectConfig();

    expect(origin.bundlerConfigs[0]!.optimization?.moduleIds).toBe('named');
    expect(origin.bundlerConfigs[1]!.optimization?.moduleIds).toBe(
      'deterministic',
    );
  });

  test('respects user configured module ids for web target', async () => {
    const rslibConfig: RslibConfig = {
      lib: [{}],
      output: {
        target: 'web',
      },
      tools: {
        rspack: {
          optimization: {
            moduleIds: 'named',
          },
        },
      },
    };

    const rslib = await createRslib({
      config: rslibConfig,
    });
    const { origin } = await rslib.inspectConfig();

    expect(origin.bundlerConfigs[0]!.optimization?.moduleIds).toBe('named');
  });
});

describe('output environment', () => {
  test('resets Rsbuild default const environment for web target', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {},
        {
          tools: {
            rspack: {
              output: {
                environment: {
                  const: false,
                },
              },
            },
          },
        },
        {
          plugins: [
            {
              name: 'test:set-lib-output-environment-const',
              setup(api) {
                api.modifyBundlerChain((chain) => {
                  chain.output.merge({
                    environment: {
                      const: false,
                    },
                  });
                });
              },
            } satisfies RsbuildPlugin,
          ],
        },
      ],
      output: {
        target: 'web',
      },
    };

    const rslib = await createRslib({
      config: rslibConfig,
    });
    const { origin } = await rslib.inspectConfig();

    expect(
      origin.bundlerConfigs[0]!.output?.environment?.const,
    ).toBeUndefined();
    expect(origin.bundlerConfigs[1]!.output?.environment?.const).toBe(false);
    expect(origin.bundlerConfigs[2]!.output?.environment?.const).toBe(false);
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

    expect(composedRsbuildConfig[0]!.config.output?.minify)
      .toMatchInlineSnapshot(`
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

    expect(composedRsbuildConfig[2]!.config.output?.minify)
      .toMatchInlineSnapshot(`
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

describe('wasm', () => {
  test('does not allow preserve mode with bundle enabled', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          bundle: true,
          format: 'esm',
          wasm: { mode: 'preserve' },
        },
      ],
    };

    await expect(() =>
      composeRsbuildEnvironments(rslibConfig),
    ).rejects.toThrowError(
      'When using "wasm.mode: preserve", "bundle" must be set to "false". Use "wasm.mode: compile" to process WebAssembly in bundle mode.',
    );
  });

  test.each(['cjs', 'umd', 'iife', 'mf'] as const)(
    'does not allow wasm config with %s format',
    async (format) => {
      const rslibConfig: RslibConfig = {
        lib: [
          {
            format,
            plugins:
              format === 'mf'
                ? [pluginModuleFederation({ name: 'test-mf' }, {})]
                : undefined,
            wasm: {},
          },
        ],
      };

      await expect(() =>
        composeRsbuildEnvironments(rslibConfig),
      ).rejects.toThrowError(
        '"wasm" only supports the "esm" format. Set "format" to "esm" or omit it.',
      );
    },
  );
});
