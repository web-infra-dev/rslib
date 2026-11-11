import { createRslib } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Execute the emitted modules: snapshots alone did not detect the missing
// interop helper, dropped export, and conflicting CJS factory parameter in #1806.
for (const runtimeMode of ['rspack', 'webpack'] as const) {
  describe(`runtime mode: ${runtimeMode}`, () => {
    for (const concatenateModules of [true, false]) {
      test.each([false, true])(
        `executes modern-module exports before and after bundling again (concatenateModules: ${concatenateModules}, minify: %s)`,
        async (minify) => {
          const dist = join(
            __dirname,
            'dist',
            `${runtimeMode}-${concatenateModules}-${minify}`,
          );
          const rslib = await createRslib({
            cwd: __dirname,
            config: {
              lib: [{ format: 'esm' }],
              logLevel: 'silent',
              performance: { buildCache: false },
              source: {
                entry: Object.fromEntries(
                  ['context', 'direct', 'specifier', 'exports', 'a', 'b'].map(
                    (name) => [name, `./src/${name}.js`],
                  ),
                ),
              },
              output: {
                target: 'node',
                distPath: { root: dist },
                filename: { js: '[name].mjs' },
                minify,
              },
              tools: {
                rspack: {
                  // Exercise the default as well as the explicit escape hatch.
                  ...(runtimeMode === 'webpack'
                    ? { experiments: { runtimeMode } }
                    : {}),
                  optimization: {
                    concatenateModules,
                    runtimeChunk: { name: 'runtime' },
                  },
                },
              },
            },
          });
          const result = await rslib.build();
          await result.close();
          const load = (name: string) =>
            import(pathToFileURL(join(dist, `${name}.mjs`)).href);

          const [context, direct, specifier, exports, a, b] = await Promise.all(
            ['context', 'direct', 'specifier', 'exports', 'a', 'b'].map(load),
          );
          expect(context.context()).toBeUndefined();
          expect(direct.rspackRequire()).toBeUndefined();
          expect(specifier.rspackRequire()).toBeUndefined();
          expect({ ...exports }).toEqual({ exports: 42 });
          expect(a.value).toBe('42:a');
          expect(b.value).toBe('42:b');

          // Published multi-entry output and its shared runtime must remain
          // executable when another project bundles them again.
          const consumerDist = join(dist, 'consumer');
          const consumer = await createRslib({
            cwd: __dirname,
            config: {
              lib: [{ format: 'esm' }],
              logLevel: 'silent',
              performance: { buildCache: false },
              source: {
                entry: { a: join(dist, 'a.mjs'), b: join(dist, 'b.mjs') },
              },
              output: {
                distPath: { root: consumerDist },
                filename: { js: '[name].mjs' },
                minify,
              },
              tools: {
                rspack: {
                  ...(runtimeMode === 'webpack'
                    ? { experiments: { runtimeMode } }
                    : {}),
                  optimization: { concatenateModules },
                },
              },
            },
          });
          const consumerResult = await consumer.build();
          await consumerResult.close();
          const consumerA = await import(
            pathToFileURL(join(consumerDist, 'a.mjs')).href
          );
          const consumerB = await import(
            pathToFileURL(join(consumerDist, 'b.mjs')).href
          );
          expect(consumerA.value).toBe('42:a');
          expect(consumerB.value).toBe('42:b');
        },
      );
    }
  });
}
