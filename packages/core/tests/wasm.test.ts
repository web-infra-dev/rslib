import { describe, expect, test } from '@rstest/core';
import { composeCreateRsbuildConfig } from '../src/config';
import type { RslibConfig } from '../src/types/config';

describe('wasm config', () => {
  test('should compose wasm config for web target', async () => {
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

  test('should reject wasm in non-esm output', async () => {
    const config: RslibConfig = {
      lib: [
        {
          format: 'cjs',
          bundle: true,
          wasm: true,
        },
      ],
    };

    await expect(composeCreateRsbuildConfig(config)).rejects.toThrow(
      'Rslib WASM support currently only works with ESM output. Use format: "esm".',
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
