import { createRslib, loadConfig } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { setImmediate } from 'node:timers/promises';
import {
  buildAndGetResults,
  createTempFiles,
  getFileBySuffix,
  globContentJSON,
  queryContent,
  rslibBuild,
} from 'test-helper';

describe('dts with JavaScript API when bundle: false', () => {
  const basicPath = join(__dirname, 'basic');

  test('basic', async () => {
    const { contents } = await buildAndGetResults({
      fixturePath: basicPath,
      type: 'dts',
    });
    for (const format of ['esm', 'cjs'] as const) {
      expect(Object.keys(contents[format])).toHaveLength(2);
      expect(getFileBySuffix(contents[format], 'index.d.ts').trim()).toBe(
        "export { add } from './utils.js';",
      );
      expect(getFileBySuffix(contents[format], 'utils.d.ts').trim()).toBe(
        'export declare const add: (a: number, b: number) => number;',
      );
    }
  });

  test('rebuilds declarations in watch mode', async () => {
    const loadedConfig = await loadConfig({ cwd: basicPath });
    loadedConfig.content.performance = {
      ...loadedConfig.content.performance,
      buildCache: false,
    };
    const rslib = await createRslib({ cwd: basicPath, config: loadedConfig });
    const firstBuild = new Promise<void>((resolve) => {
      rslib.onAfterCreateRsbuild(({ rsbuild }) => {
        rsbuild.onAfterBuild(() => resolve());
      });
    });
    const sourceFile = join(basicPath, 'src/utils.ts');
    const original = await readFile(sourceFile, 'utf8');
    const configFile = join(basicPath, 'tsconfig.json');
    const originalConfig = await readFile(configFile, 'utf8');
    const declarationFile = join(basicPath, 'dist/esm/utils.d.ts');
    await rm(join(basicPath, 'dist/esm'), {
      recursive: true,
      force: true,
    });
    const result = await rslib.build({ watch: true, lib: ['esm'] });
    try {
      await firstBuild;
      // Rspack installs its watcher on the next tick after the done hooks.
      await setImmediate();
      await expect
        .poll(() => readFile(declarationFile, 'utf8').catch(() => ''))
        .toContain('=> number');
      await writeFile(
        sourceFile,
        'export const add = (a: number, b: number): string => String(a + b);',
      );
      await expect
        .poll(() => readFile(declarationFile, 'utf8').catch(() => ''), {
          timeout: 10_000,
        })
        .toContain('=> string');
      const config = JSON.parse(originalConfig);
      config.compilerOptions.declarationMap = true;
      await writeFile(configFile, JSON.stringify(config));
      await expect
        .poll(() => readFile(declarationFile, 'utf8').catch(() => ''), {
          timeout: 10_000,
        })
        .toContain('sourceMappingURL=utils.d.ts.map');
      expect(
        JSON.parse(await readFile(`${declarationFile}.map`, 'utf8')),
      ).toMatchObject({
        file: 'utils.d.ts',
      });
    } finally {
      await result.close();
      await writeFile(sourceFile, original);
      await writeFile(configFile, originalConfig);
    }
  });

  test('supports composite projects without the unstable incremental API', async () => {
    const configFile = join(basicPath, 'tsconfig.json');
    const original = await readFile(configFile, 'utf8');
    const config = JSON.parse(original);
    config.compilerOptions.composite = true;
    try {
      await writeFile(configFile, JSON.stringify(config));
      const { buildResult } = await rslibBuild({
        cwd: basicPath,
        lib: ['esm'],
      });
      await buildResult.close();
      expect(
        await readFile(join(basicPath, 'dist/esm/utils.d.ts'), 'utf8'),
      ).toContain('=> number');
    } finally {
      await writeFile(configFile, original);
    }
  });

  test('reports config diagnostics from the JavaScript API', async () => {
    const configFile = join(basicPath, 'tsconfig.json');
    const original = await readFile(configFile, 'utf8');
    const config = JSON.parse(original);
    config.compilerOptions.target = 'invalid';
    try {
      await writeFile(configFile, JSON.stringify(config));
      await expect(
        rslibBuild({ cwd: basicPath, lib: ['esm'] }),
      ).rejects.toThrow('declaration files generation');
    } finally {
      await writeFile(configFile, original);
    }
  });

  test('distPath', async () => {
    const fixturePath = join(__dirname, 'dist-path');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/dist-path/dist/custom/utils/strings.d.ts",
      ]
    `);
  });

  test('reports type errors and respects abortOnError', async () => {
    const fixturePath = join(__dirname, 'abort-on-error');
    await expect(
      rslibBuild({
        cwd: fixturePath,
        modifyConfig(config) {
          for (const lib of config.lib!) {
            lib.dts = { ...(lib.dts as object), abortOnError: undefined };
          }
        },
      }),
    ).rejects.toThrow('declaration files generation');

    const { js, dts } = await buildAndGetResults({
      fixturePath,
      type: 'all',
    });
    expect(js.isSuccess).toBe(true);
    expect(getFileBySuffix(js.contents.esm, 'index.js')).toContain('getA');
    expect(dts.files.esm).toHaveLength(2);
    expect(getFileBySuffix(dts.contents.esm, 'index.d.ts')).toContain(
      'export declare const getA: (item: A) => A;',
    );
  });

  test('autoExtension: true', async () => {
    const fixturePath = join(__dirname, 'auto-extension');
    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/sum.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/utils/numbers.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/auto-extension/dist/types/cjs/utils/strings.d.cts",
      ]
    `);
  });

  test('should use declarationDir when not set dts.distPath', async () => {
    const fixturePath = join(__dirname, 'declaration-dir');
    const distTypesPath = join(fixturePath, 'dist-types');

    await buildAndGetResults({ fixturePath, type: 'dts' });

    const distTypeFiles = await globContentJSON(distTypesPath, {
      absolute: true,
    });
    const distTypeFilePaths = Object.keys(distTypeFiles).sort();

    expect(distTypeFilePaths).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-dir/dist-types/utils/strings.d.ts",
      ]
    `);
  });

  test('should clean dts dist files', async () => {
    const fixturePath = join(__dirname, 'clean');

    const checkFiles = await createTempFiles(fixturePath, false);

    const { files } = await buildAndGetResults({ fixturePath, type: 'dts' });

    for (const file of checkFiles) {
      expect(existsSync(file)).toBe(false);
    }

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/esm/utils/strings.d.ts",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/sum.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/utils/numbers.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/clean/dist-types/cjs/utils/strings.d.ts",
      ]
    `);
  });

  test('alias', async () => {
    const fixturePath = join(__dirname, 'alias');
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(contents.esm).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts-api-new/bundle-false/alias/dist/esm/index.d.ts": "export {} from '../../compile/prebundle-pkg/index.js';
      ",
      }
    `);

    expect(contents.cjs).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/dts-api-new/bundle-false/alias/dist/cjs/index.d.ts": "export {} from '../../compile/prebundle-pkg/index.js';
      ",
      }
    `);
  });

  test('declarationMap', async () => {
    const fixturePath = join(__dirname, 'declaration-map');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });

    expect(files.esm).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/esm/index.d.ts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/esm/index.d.ts.map",
      ]
    `);

    expect(files.cjs).toMatchInlineSnapshot(`
      [
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/cjs/index.d.cts",
        "<ROOT>/tests/integration/dts-api-new/bundle-false/declaration-map/dist/cjs/index.d.cts.map",
      ]
    `);

    const { content: indexDtsEsm } = queryContent(contents.esm, 'index.d.ts', {
      basename: true,
    });
    const { content: indexDtsCjs } = queryContent(contents.cjs, 'index.d.cts', {
      basename: true,
    });
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
  });

  test('process files - alias, extension and banner / footer in memory', async () => {
    const fixturePath = join(__dirname, 'process-files');
    // Avoid existing output directories masking in-memory directory resolution.
    await rm(join(fixturePath, 'dist'), { recursive: true, force: true });
    const { contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });
    for (const [format, extension] of [
      ['esm', 'js'],
      ['cjs', 'cjs'],
    ] as const) {
      const output = contents[format];
      expect(Object.keys(output)).toHaveLength(3);
      for (const content of Object.values(output)) {
        expect(content).toContain('// declaration banner');
        expect(content).toContain('// declaration footer');
        expect(content).not.toContain('@utils');
      }
      const entry = format === 'esm' ? 'index.d.ts' : 'index.d.cts';
      expect(getFileBySuffix(output, entry)).toContain(
        `export { add } from './utils.${extension}';`,
      );
      expect(getFileBySuffix(output, entry)).toContain(
        `export type { Options } from './options/index.${extension}';`,
      );
    }
  });

  test.each([false, true])(
    'respects noEmitOnError: %s with abortOnError disabled',
    async (noEmitOnError) => {
      const fixturePath = join(__dirname, 'no-emit-on-error');
      const { buildResult } = await rslibBuild({
        cwd: fixturePath,
        modifyConfig(config) {
          config.source = {
            ...config.source,
            tsconfigPath: noEmitOnError
              ? './tsconfig.noEmitOnError.json'
              : './tsconfig.json',
          };
        },
      });
      await buildResult.close();
      const declarationFile = join(fixturePath, 'dist/esm/index.d.ts');
      expect(existsSync(declarationFile)).toBe(!noEmitOnError);
      const declaration = await readFile(declarationFile, 'utf8').catch(
        () => undefined,
      );
      expect(declaration?.trim()).toBe(
        noEmitOnError ? undefined : 'export declare const invalid: number;',
      );
    },
  );

  test('emits transitive dependencies outside tsconfig files with .d.mts maps', async () => {
    const fixturePath = join(__dirname, 'transitive-dependency');
    const { files, contents } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });
    expect(files.esm.map((file) => basename(file)).sort()).toEqual([
      'dependency.d.mts',
      'dependency.d.mts.map',
      'index.d.mts',
      'index.d.mts.map',
    ]);
    const { content: entry } = queryContent(contents.esm, 'index.d.mts', {
      basename: true,
    });
    expect(entry).toContain("export { value } from './dependency.mjs';");
    expect(entry).toContain('//# sourceMappingURL=index.d.mts.map');
    const { content: dependency } = queryContent(
      contents.esm,
      'dependency.d.mts',
      { basename: true },
    );
    expect(dependency).toContain('export declare const value = 42;');
    for (const file of ['index.d.mts', 'dependency.d.mts']) {
      const { content: map } = queryContent(contents.esm, `${file}.map`, {
        basename: true,
      });
      expect(JSON.parse(map).file).toBe(file);
    }
  });
});
