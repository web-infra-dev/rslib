import { join } from 'node:path';
import { createRslib } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';
import { expectFile } from 'test-helper';

describe('rslib.build', async () => {
  test('builds project and returns stats', async () => {
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

    expect(rslib.getRslibConfig().root).toMatchInlineSnapshot(
      `"<ROOT>/tests/integration/javascript-api/build"`,
    );

    const result = await rslib.build();

    await result.close();
    const statsJson = result.stats?.toJson({ all: true });

    expect(statsJson?.name).toBe('esm');
    expect(statsJson?.assets?.length).toBeGreaterThan(0);
  });

  test('builds specific library with lib option', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
            output: {
              distPath: './dist-esm0',
            },
          },
          {
            format: 'esm',
            id: 'new-esm',
            output: {
              distPath: './dist-esm1',
            },
          },
          {
            format: 'cjs',
            output: {
              distPath: './dist-cjs',
            },
          },
        ],
        logLevel: 'silent',
      },
    });

    const result1 = await rslib.build({
      lib: ['cjs'],
    });
    await result1.close();

    await expectFile(join(rslib.getRslibConfig().root!, 'dist-cjs/index.js'));

    const result2 = await rslib.build({
      lib: ['new-esm'],
    });
    await result2.close();

    await expectFile(join(rslib.getRslibConfig().root!, 'dist-esm1/index.js'));
  });

  test('should not load env by default', async () => {
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
    await rslib.build();

    expect(process.env.PUBLIC_FOO).toBe(undefined);
    expect(process.env.PUBLIC_BAR).toBe(undefined);
  });

  test('should allow to call `build` with `loadEnv` options', async () => {
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
      loadEnv: {
        mode: 'prod',
      },
    });
    const result = await rslib.build();

    expect(process.env.PUBLIC_FOO).toBe('foo');
    expect(process.env.PUBLIC_BAR).toBe('bar');

    await result.close();
    expect(process.env.PUBLIC_FOO).toBe(undefined);
    expect(process.env.PUBLIC_BAR).toBe(undefined);
  });
});
