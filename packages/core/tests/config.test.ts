import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { composeCreateRsbuildConfig, loadConfig } from '../src/config';
import type { RslibConfig } from '../src/types/config';

describe('Should load config file correctly', () => {
  test('Load config.js in cjs project', async () => {
    const fixtureDir = join(__dirname, 'config/cjs');
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
    const fixtureDir = join(__dirname, 'config/cjs');
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
    const fixtureDir = join(__dirname, 'config/cjs');
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
    const fixtureDir = join(__dirname, 'config/cjs');
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
    const fixtureDir = join(__dirname, 'config/esm');
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
    const fixtureDir = join(__dirname, 'config/esm');
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
    const fixtureDir = join(__dirname, 'config/esm');
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
    const fixtureDir = join(__dirname, 'config/esm');
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
    const composedRsbuildConfig = await composeCreateRsbuildConfig(rslibConfig);
    expect(composedRsbuildConfig).toMatchSnapshot();
  });
});
