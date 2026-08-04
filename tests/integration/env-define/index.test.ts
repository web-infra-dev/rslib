import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, proxyConsole } from 'test-helper';

test('esm preserves `import.meta.env.*` / `process.env.*` presets instead of inlining', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({ fixturePath });

  // Rsbuild would inline these presets (e.g. MODE -> "production").
  // Rslib keeps them as-is so the downstream consumer can replace them.
  expect(entries.esm).toContain('import.meta.env.MODE');
  expect(entries.esm).toContain('import.meta.env.DEV');
  expect(entries.esm).toContain('import.meta.env.BASE_URL');
  expect(entries.esm).toContain('process.env.BASE_URL');
  expect(entries.esm).toContain('process.env.ASSET_PREFIX');
  expect(entries.esm).toContain('process.env.MY_CUSTOM');
});

test('cjs preserves `process.env.*` and replaces `import.meta.env.*` with undefined', async () => {
  const fixturePath = __dirname;
  const { logs, restore } = proxyConsole('warn');
  const { entries } = await buildAndGetResults({ fixturePath }).finally(restore);

  // `import.meta` is a syntax error in CJS, so it cannot be preserved. Rspack
  // replaces unknown properties with `undefined` and emits a warning.
  expect(entries.cjs).not.toContain('import.meta.env');
  expect(entries.cjs).not.toContain('"production"');
  expect(entries.cjs).toContain('const env = void 0;');
  expect(entries.cjs).toContain('const mode = (void 0).MODE;');
  // `process.env.*` access stays valid in CJS, so it is preserved.
  expect(entries.cjs).toContain('process.env.BASE_URL');
  expect(entries.cjs).toContain('process.env.ASSET_PREFIX');
  expect(entries.cjs).toContain('process.env.MY_CUSTOM');

  const warnings = logs.map(stripAnsi).join('\n');
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env.MODE' is replaced with undefined.",
  );
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env' is replaced with undefined.",
  );
});

test('umd keeps Rsbuild default inlining', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({ fixturePath });

  // umd is a self-contained bundle, presets are inlined into literals.
  expect(entries.umd).not.toContain('import.meta.env');
  expect(entries.umd).toContain('"production"');
  expect(entries.umd).toContain('const processBase = "/";');
  expect(entries.umd).toContain('const processAssetPrefix = "";');
  expect(entries.umd).not.toContain('process.env');
});

test('user source.define overrides Rslib env presets', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({
    fixturePath,
    configPath: './rslib.override.config.ts',
  });

  expect(entries.esm).toContain('"custom-mode"');
  expect(entries.esm).not.toContain('import.meta.env.MODE');
  expect(entries.cjs).toContain('"custom-cjs-mode"');
  expect(entries.cjs).not.toContain('import.meta.env.MODE');

  for (const format of ['esm', 'cjs', 'umd'] as const) {
    expect(entries[format]).toContain('"/custom/"');
    expect(entries[format]).not.toContain('process.env.BASE_URL');
  }
});
