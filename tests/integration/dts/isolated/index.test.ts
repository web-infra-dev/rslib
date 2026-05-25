import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent, runCliSync } from 'test-helper';

describe('isolated dts', () => {
  test('abortOnError: false should throw configuration error', async () => {
    const fixturePath = join(__dirname, 'abort-on-error');

    const { status, stderr, stdout } = runCliSync('build', {
      cwd: fixturePath,
      stdio: 'pipe',
    });

    expect(status).toBe(1);
    expect(stripAnsi(stderr)).toContain(
      'Can not set "dts.abortOnError: false" when "dts.isolated: true".',
    );
    expect(stripAnsi(stdout)).not.toContain(
      'declaration files generated with isolated declaration',
    );
  });

  test('should support autoExtension in bundleless mode', async () => {
    const fixturePath = join(__dirname, 'bundleless');
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/isolated/bundleless/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts/isolated/bundleless/dist-types/esm/sum.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/isolated/bundleless/dist-types/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts/isolated/bundleless/dist-types/cjs/sum.d.cts",
      ]
    `);
  });

  test('should support alias rewrite in isolated mode', async () => {
    const fixturePath = join(__dirname, 'alias');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    const { content: esmIndex } = queryContent(contents.esm!, 'index.d.ts', {
      basename: true,
    });
    const { content: cjsIndex } = queryContent(contents.cjs!, 'index.d.cts', {
      basename: true,
    });

    expect(esmIndex).toContain(`from '../../compile/aliased-pkg'`);
    expect(cjsIndex).toContain(`from '../../compile/aliased-pkg'`);
  });

  test('should support bundled output in isolated mode', async () => {
    const fixturePath = join(__dirname, 'bundle');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/isolated/bundle/dist-bundle/esm/index.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts/isolated/bundle/dist-bundle/cjs/index.d.cts",
      ]
    `);

    const { content: esmIndex } = queryContent(contents.esm!, 'index.d.ts', {
      basename: true,
    });
    const { content: cjsIndex } = queryContent(contents.cjs!, 'index.d.cts', {
      basename: true,
    });

    expect(esmIndex).toContain('export declare interface Foo');
    expect(esmIndex).toContain('export declare function sum');
    expect(cjsIndex).toContain('export declare interface Foo');
    expect(cjsIndex).toContain('export declare function sum');
  });

  test('should clean dist files and temporary declaration files', async () => {
    const fixturePath = join(__dirname, 'clean');
    const staleFiles = [
      join(fixturePath, 'dist-types/esm/stale.d.ts'),
      join(fixturePath, 'dist-types/cjs/stale.d.cts'),
      join(fixturePath, 'dist-bundle/esm/stale.d.ts'),
      join(fixturePath, 'dist-bundle/cjs/stale.d.cts'),
      join(fixturePath, '.rslib/declarations/esm/stale.d.ts'),
      join(fixturePath, '.rslib/declarations/cjs/stale.d.ts'),
    ];

    await Promise.all(
      staleFiles.map(async (file) => {
        await fs.mkdir(dirname(file), { recursive: true });
        await fs.writeFile(file, 'stale');
      }),
    );

    await buildAndGetResults({ fixturePath, type: 'dts' });

    for (const file of staleFiles) {
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    }
  });
});
