import { join } from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { describe, expect, test, vi } from 'vitest';
import {
  composeCreateRsbuildConfig,
  composeRsbuildEnvironments,
  loadConfig,
} from '../src/config';
import type { RslibConfig } from '../src/types/config';

vi.mock('rslog');

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
          format: 'mf',
          plugins: [pluginModuleFederation({})],
        },
      ],
      source: {
        preEntry: './a.js',
      },
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
    };
    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);
    expect(composedRsbuildConfig).toMatchSnapshot();
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
        "chrome >= 63.0.0",
        "edge >= 79.0.0",
        "firefox >= 67.0.0",
        "ios >= 13.0.0",
        "node >= 13.2.0",
        "opera >= 50.0.0",
        "safari >= 13.0.0",
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
