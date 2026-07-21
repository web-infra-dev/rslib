import { describe, expect, test } from '@rstest/core';
import { basename, join } from 'node:path';
import { buildAndGetResults } from 'test-helper';

describe('output config', () => {
  describe('chunkFileName', () => {
    test('should suffix index for multi-compiler builds', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib1.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(2);
      expect(rspackConfig[0]!.optimization?.runtimeChunk).toBeUndefined();
      expect(rspackConfig[1]!.optimization?.runtimeChunk).toBeUndefined();
      expect(rspackConfig[0]!.output?.chunkFilename).toBe('[name].js');
      expect(rspackConfig[1]!.output?.chunkFilename).toBe('[name]~1.js');

      const esm0BaseNames = (files.esm0 ?? []).map((p) => basename(p));
      const esm1BaseNames = (files.esm1 ?? []).map((p) => basename(p));

      expect(esm0BaseNames).toContain('lib1.js');
      expect(esm1BaseNames).toContain('lib2.js');
      expect(esm0BaseNames.some((name) => /^\d+\.js$/.test(name))).toBe(false);
      expect(esm1BaseNames.some((name) => /^\d+~1\.js$/.test(name))).toBe(
        false,
      );
      expect(esm0BaseNames.some((n) => n === 'shared.js')).toBeTruthy();
      expect(esm1BaseNames.some((n) => n === 'shared~1.js')).toBeTruthy();
    });

    test('should suffix index for multi-compiler builds (with filename)', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib2.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(2);
      expect(
        rspackConfig.slice(0, 2).map((config) => config.output?.filename),
      ).toEqual([
        'static/js/[name].[contenthash:10].js',
        'static/js/[name].[contenthash:10].js',
      ]);
      expect(rspackConfig[0]!.output?.chunkFilename).toBe(
        'static/js/[name].[contenthash:10].js',
      );
      expect(rspackConfig[1]!.output?.chunkFilename).toBe(
        'static/js/[name]~1.[contenthash:10].js',
      );

      const esm0BaseNames = (files.esm0 ?? []).map((p) => basename(p));
      const esm1BaseNames = (files.esm1 ?? []).map((p) => basename(p));

      expect(
        esm0BaseNames.some((n) => /^shared\.[a-f0-9]+\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        esm1BaseNames.some((n) => /^shared~1\.[a-f0-9]+\.js$/.test(n)),
      ).toBeTruthy();
    });

    test('should suffix index for multi-compiler builds (with chunkFilename)', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib3.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(2);
      expect(
        rspackConfig.slice(0, 2).map((config) => config.output?.filename),
      ).toEqual([
        'static1/js/[name].js',
        'static2/js/[name].[contenthash:10].js',
      ]);
      expect(rspackConfig[0]!.output?.chunkFilename).toBe(
        'static1/js/[name].js',
      );
      expect(rspackConfig[1]!.output?.chunkFilename).toBe(
        'static2/js/[name]~1.[contenthash:10].js',
      );

      expect(
        files.esm0!.some((n) => /static1\/js\/shared\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        files.esm0!.some((n) => /static1\/js\/lib1\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        files.esm0!.some((n) =>
          /static2\/js\/shared~1\.[a-f0-9]+\.js$/.test(n),
        ),
      ).toBeTruthy();
      expect(
        files.esm0!.some((n) => /static2\/js\/lib2\.[a-f0-9]+\.js$/.test(n)),
      ).toBeTruthy();
    });

    test('should suffix non-entry initial chunks for later compilers', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib4.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(4);
      expect(rspackConfig[0]!.output?.filename).toBe('[name].js');
      expect(typeof rspackConfig[1]!.output?.filename).toBe('function');
      expect(typeof rspackConfig[2]!.output?.filename).toBe('function');
      expect(typeof rspackConfig[3]!.output?.filename).toBe('function');
      expect(rspackConfig[0]!.optimization?.runtimeChunk).toBeUndefined();
      expect(rspackConfig[1]!.optimization?.runtimeChunk).toBeUndefined();
      expect(rspackConfig[2]!.optimization?.runtimeChunk).toEqual({
        name: 'rslib-runtime',
      });
      expect(rspackConfig[3]!.optimization?.runtimeChunk).toEqual({
        name: 'manual-runtime',
      });

      const getBaseNames = (paths: string[] | undefined) =>
        (paths ?? []).map((p) => basename(p));
      const esm0BaseNames = getBaseNames(files.esm0);
      const esm1BaseNames = getBaseNames(files.esm1);
      const esm2BaseNames = getBaseNames(files.esm2);
      const esm3BaseNames = getBaseNames(files.esm3);

      expect(esm0BaseNames).toContain('runtime1.js');
      expect(esm1BaseNames).toContain('runtime2.js');
      expect(esm2BaseNames).toEqual(
        expect.arrayContaining(['multi1.js', 'multi2.js']),
      );
      expect(esm3BaseNames).toContain('manual.js');
      expect(esm0BaseNames.some((name) => /^\d+\.js$/.test(name))).toBe(true);
      expect(esm1BaseNames.some((name) => /^\d+~1\.js$/.test(name))).toBe(true);
      expect(esm2BaseNames).toContain('rslib-runtime~2.js');
      expect(esm3BaseNames).toContain('manual-runtime~3.js');
      expect(esm2BaseNames).toContain('shared~2.js');
      expect(esm3BaseNames).toContain('shared~3.js');
    });

    test('should not suffix index for single-compiler builds', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-single');
      const { files } = await buildAndGetResults({ fixturePath });

      const esmBaseNames = (files.esm ?? []).map((p) => basename(p));
      expect(esmBaseNames.some((n) => /~\d+\.js$/.test(n))).toBeFalsy();
      expect(
        esmBaseNames.some(
          (n) => /^\d+\.js$/.test(n) || /shared.*\.js$/.test(n),
        ),
      ).toBeTruthy();
    });
  });
});
