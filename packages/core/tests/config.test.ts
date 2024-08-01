import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { composeCreateRsbuildConfig, loadConfig } from '../src/config';
import type { RslibConfig } from '../src/types/config';

describe('Should load config file correctly', () => {
  test('Load config.js in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configDir = join(fixtureDir, 'rslib.config.js');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.mjs in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configDir = join(fixtureDir, 'rslib.config.mjs');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.ts in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configDir = join(fixtureDir, 'rslib.config.ts');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.ts',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.cjs with defineConfig in cjs project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/cjs');
    const configDir = join(fixtureDir, 'rslib.config.cjs');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.js in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configDir = join(fixtureDir, 'rslib.config.js');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.cjs in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configDir = join(fixtureDir, 'rslib.config.cjs');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.ts in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configDir = join(fixtureDir, 'rslib.config.ts');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.ts',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });

  test('Load config.mjs with defineConfig in esm project', async () => {
    const fixtureDir = join(__dirname, 'fixtures/config/esm');
    const configDir = join(fixtureDir, 'rslib.config.mjs');
    const config = await loadConfig(configDir);
    expect(config).toEqual({
      lib: [],
      source: {
        entry: {
          main: './foo/index.js',
        },
      },
      _privateMeta: {
        configFilePath: configDir,
      },
    });
  });
});

describe('Should compose create Rsbuild config correctly', () => {
  test('Merge Rsbuild config', async () => {
    const rslibConfig: RslibConfig = {
      lib: [
        {
          format: 'esm',
          source: {
            alias: {
              foo: 'foo/esm',
            },
            preEntry: './b.js',
          },
        },
        {
          format: 'cjs',
          source: {
            alias: {
              bar: 'bar/cjs',
            },
            preEntry: ['./c.js', './d.js'],
          },
        },
        {
          format: 'umd',
        },
      ],
      source: {
        alias: {
          foo: 'foo',
          bar: 'bar',
        },
        preEntry: './a.js',
      },
      output: {
        filenameHash: false,
        minify: true,
      },
    };
    const composedRsbuildConfig = await composeCreateRsbuildConfig(
      rslibConfig,
      process.cwd(),
    );
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

    const composedRsbuildConfig = await composeCreateRsbuildConfig(
      rslibConfig,
      process.cwd(),
    );

    expect(
      composedRsbuildConfig[0].config.output?.overrideBrowserslist,
    ).toMatchInlineSnapshot(`
      [
        "last 1 node versions",
        "last 1 Chrome versions",
        "last 1 Firefox versions",
        "last 1 Edge versions",
        "last 1 Safari versions",
        "last 1 ios_saf versions",
        "not dead",
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

    const composedRsbuildConfig = await composeCreateRsbuildConfig(
      rslibConfig,
      process.cwd(),
    );

    expect(
      composedRsbuildConfig[0].config.output?.overrideBrowserslist,
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

    const composedRsbuildConfig = await composeCreateRsbuildConfig(
      rslibConfig,
      process.cwd(),
    );

    expect(
      composedRsbuildConfig[0].config.output?.overrideBrowserslist,
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
          output: {
            syntax: 'es2015',
          },
          format: 'esm',
        },
      ],
    };

    const composedRsbuildConfig = await composeCreateRsbuildConfig(
      rslibConfig,
      process.cwd(),
    );

    expect(
      composedRsbuildConfig[0].config.output?.overrideBrowserslist,
    ).toMatchInlineSnapshot(`
      [
        "Chrome >= 63.0.0",
        "Edge >= 79.0.0",
        "Firefox >= 67.0.0",
        "iOS >= 13.0.0",
        "Node >= 10.0.0",
        "Opera >= 50.0.0",
        "Safari >= 13.0.0",
      ]
    `);
  });
});
