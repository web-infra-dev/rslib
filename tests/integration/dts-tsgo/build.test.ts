import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults, createTempFiles, queryContent } from 'test-helper';

describe.skipIf(process.version.startsWith('v18'))(
  'dts with tsgo when build: true',
  () => {
    test('basic', async () => {
      const fixturePath = join(__dirname, 'build', 'basic');
      const { files } = await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });

      expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/basic/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-tsgo/build/basic/dist/esm/sum.d.ts",
      ]
    `);

      const referenceDistPath = join(
        fixturePath,
        '../__references__/dist/index.d.ts',
      );
      expect(existsSync(referenceDistPath)).toBeTruthy();

      const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
      expect(existsSync(buildInfoPath)).toBeTruthy();
    });

    test('distPath', async () => {
      const fixturePath = join(__dirname, 'build', 'dist-path');
      const { files } = await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });

      expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/dist-path/dist/custom/index.d.ts",
      ]
    `);

      const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
      expect(existsSync(buildInfoPath)).toBeTruthy();
    });

    test('autoExtension: true', async () => {
      const fixturePath = join(__dirname, 'build', 'auto-extension');
      const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

      expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/auto-extension/dist/types/index.d.cts",
        "<ROOT>/tests/integration/dts-tsgo/build/auto-extension/dist/types/sum.d.cts",
      ]
    `);

      const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
      expect(existsSync(buildInfoPath)).toBeTruthy();
    });

    test('process files - auto extension and banner / footer', async () => {
      const fixturePath = join(__dirname, 'build', 'process-files');
      const { contents } = await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });

      expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts-tsgo/build/process-files/dist/esm/index.d.mts": "/*! hello banner dts build*/
      export declare const num1 = 1;

      /*! hello banner dts build*/
      ",
      }
    `);

      const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
      expect(existsSync(buildInfoPath)).toBeTruthy();
    });

    test('abortOnError: false', async () => {
      const fixturePath = join(__dirname, 'build', 'abort-on-error');

      const result = spawnSync('npx', ['rslib', 'build'], {
        cwd: fixturePath,
        // do not show output in test console
        stdio: 'ignore',
        shell: true,
      });

      expect(result.status).toBe(0);

      const buildInfoPath = join(fixturePath, 'tsconfig.tsbuildinfo');
      expect(existsSync(buildInfoPath)).toBeTruthy();
    });

    test('should clean dts dist files', async () => {
      const fixturePath = join(__dirname, 'build', 'clean');

      const checkFiles = await createTempFiles(fixturePath, false);

      const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

      for (const file of checkFiles) {
        expect(existsSync(file)).toBe(false);
      }

      expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/clean/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-tsgo/build/clean/dist-types/esm/sum.d.ts",
      ]
    `);

      expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/clean/dist-types/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts-tsgo/build/clean/dist-types/cjs/sum.d.ts",
      ]
    `);

      const referenceDistPath = join(
        fixturePath,
        '../__references__/dist/index.d.ts',
      );
      expect(existsSync(referenceDistPath)).toBeTruthy();

      const cjsBuildInfoPath = join(fixturePath, 'tsconfig.cjs.tsbuildinfo');
      expect(existsSync(cjsBuildInfoPath)).toBeTruthy();

      const esmBuildInfoPath = join(fixturePath, 'tsconfig.esm.tsbuildinfo');
      expect(existsSync(esmBuildInfoPath)).toBeTruthy();
    });

    test('declarationMap', async () => {
      const fixturePath = join(__dirname, 'build', 'declaration-map');
      const { files, contents } = await buildAndGetResults({
        fixturePath,
        type: 'dts',
      });

      expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/declaration-map/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-tsgo/build/declaration-map/dist/esm/index.d.ts.map",
      ]
    `);

      expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-tsgo/build/declaration-map/dist/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts-tsgo/build/declaration-map/dist/cjs/index.d.cts.map",
      ]
    `);

      const { content: indexDtsEsm } = queryContent(
        contents.esm,
        'index.d.ts',
        {
          basename: true,
        },
      );
      const { content: indexDtsCjs } = queryContent(
        contents.cjs,
        'index.d.cts',
        {
          basename: true,
        },
      );
      const { content: indexMapEsm } = queryContent(
        contents.esm,
        'index.d.ts.map',
        {
          basename: true,
        },
      );
      const { content: indexMapCjs } = queryContent(
        contents.cjs,
        'index.d.cts.map',
        {
          basename: true,
        },
      );
      expect(indexDtsEsm).toContain('//# sourceMappingURL=index.d.ts.map');
      expect(indexDtsCjs).toContain('//# sourceMappingURL=index.d.cts.map');
      expect(indexMapEsm).toContain('"file":"index.d.ts"');
      expect(indexMapCjs).toContain('"file":"index.d.cts"');

      const referenceEsmDistPath = join(
        fixturePath,
        '../__references__/dist/index.d.ts',
      );
      expect(existsSync(referenceEsmDistPath)).toBeTruthy();

      // TODO: can not rename dts files in reference yet
      // const referenceCjsDistPath = join(
      //   fixturePath,
      //   '../__references__/dist/index.d.cts',
      // );
      // expect(existsSync(referenceCjsDistPath)).toBeTruthy();

      const esmBuildInfoPath = join(fixturePath, 'tsconfig.esm.tsbuildinfo');
      const cjsBuildInfoPath = join(fixturePath, 'tsconfig.cjs.tsbuildinfo');
      expect(existsSync(esmBuildInfoPath)).toBeTruthy();
      expect(existsSync(cjsBuildInfoPath)).toBeTruthy();
    });
  },
);
