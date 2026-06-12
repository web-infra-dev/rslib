import { describe, expect, test } from '@rstest/core';
import { composeCreateRsbuildConfig } from '../src/config';
import type { RslibConfig } from '../src/types/config';

describe('wasm config', () => {
  test('should compose wasm config for web esm target', async () => {
    const config: RslibConfig = {
      lib: [
        {
          format: 'esm',
          bundle: true,
          wasm: true,
          output: {
            target: 'web',
          },
          source: {
            entry: {
              index: './src/index.ts',
            },
          },
        },
      ],
    };

    const [result] = await composeCreateRsbuildConfig(config);
    expect(result?.config?.plugins?.length).toBeGreaterThan(0);
  });

  test('should compose wasm config for node cjs target', async () => {
    const config: RslibConfig = {
      lib: [
        {
          format: 'cjs',
          bundle: true,
          wasm: true,
          output: {
            target: 'node',
          },
          source: {
            entry: {
              index: './src/index.ts',
            },
          },
        },
      ],
    };

    const [result] = await composeCreateRsbuildConfig(config);
    expect(result?.config?.plugins?.length).toBeGreaterThan(0);
  });

  test('should reject wasm in unsupported web cjs output', async () => {
    const config: RslibConfig = {
      lib: [
        {
          format: 'cjs',
          bundle: true,
          wasm: true,
          output: {
            target: 'web',
          },
        },
      ],
    };

    await expect(composeCreateRsbuildConfig(config)).rejects.toThrow(
      'Rslib WASM support currently only supports CJS output when target is "node".',
    );
  });

  test('should reject wasm in unsupported format', async () => {
    const config: RslibConfig = {
      lib: [
        {
          format: 'umd',
          bundle: true,
          wasm: true,
        },
      ],
    };

    await expect(composeCreateRsbuildConfig(config)).rejects.toThrow(
      'Rslib WASM support does not support format "umd" yet.',
    );
  });

  test('should reject wasm in bundleless output', async () => {
    const config: RslibConfig = {
      lib: [
        {
          format: 'esm',
          bundle: false,
          wasm: true,
        },
      ],
    };

    await expect(composeCreateRsbuildConfig(config)).rejects.toThrow(
      'Rslib WASM support currently only works with bundle: true.',
    );
  });
});
