import { basename, join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

describe('output config', () => {
  describe('chunkFileName', () => {
    test('should prefix index for multi-compiler builds', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib1.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(2);
      expect(rspackConfig[0]!.output?.chunkFilename).toBe('0~[name].js');
      expect(rspackConfig[1]!.output?.chunkFilename).toBe('1~[name].js');

      const esm0BaseNames = (files.esm0 ?? []).map((p) => basename(p));
      const esm1BaseNames = (files.esm1 ?? []).map((p) => basename(p));

      expect(esm0BaseNames.some((n) => /^0~159\.js$/.test(n))).toBeTruthy();
      expect(esm1BaseNames.some((n) => /^1~159\.js$/.test(n))).toBeTruthy();
    });

    test('should prefix index for multi-compiler builds (with filename)', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib2.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(2);
      expect(rspackConfig[0]!.output?.chunkFilename).toBe(
        'static/js/0~[name].[contenthash:8].js',
      );
      expect(rspackConfig[1]!.output?.chunkFilename).toBe(
        'static/js/1~[name].[contenthash:8].js',
      );

      const esm0BaseNames = (files.esm0 ?? []).map((p) => basename(p));
      const esm1BaseNames = (files.esm1 ?? []).map((p) => basename(p));

      expect(
        esm0BaseNames.some((n) => /^0~159\.\w+\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        esm1BaseNames.some((n) => /^1~159\.\w+\.js$/.test(n)),
      ).toBeTruthy();
    });

    test('should prefix index for multi-compiler builds (with chunkFilename)', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-multi');
      const { files, rspackConfig } = await buildAndGetResults({
        fixturePath,
        configPath: 'rslib3.config.ts',
      });

      expect(rspackConfig.length).toBeGreaterThanOrEqual(2);
      expect(rspackConfig[0]!.output?.chunkFilename).toBe(
        'static1/js/0~[name].js',
      );
      expect(rspackConfig[1]!.output?.chunkFilename).toBe(
        'static2/js/1~[name].[contenthash:8].js',
      );

      expect(
        files.esm0!.some((n) => /static1\/js\/0~159\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        files.esm0!.some((n) => /static1\/js\/lib1\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        files.esm0!.some((n) => /static2\/js\/1~159\.\w+\.js$/.test(n)),
      ).toBeTruthy();
      expect(
        files.esm0!.some((n) => /static2\/js\/lib2\.\w+\.js$/.test(n)),
      ).toBeTruthy();
    });

    test('should not prefix index for single-compiler builds', async () => {
      const fixturePath = join(__dirname, 'chunkFileName-single');
      const { files } = await buildAndGetResults({ fixturePath });

      const esmBaseNames = (files.esm ?? []).map((p) => basename(p));
      expect(esmBaseNames.some((n) => /^\d+~.+\.js$/.test(n))).toBeFalsy();
      expect(
        esmBaseNames.some(
          (n) => /^\d+\.js$/.test(n) || /shared.*\.js$/.test(n),
        ),
      ).toBeTruthy();
    });
  });
});
