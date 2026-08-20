import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, proxyConsole } from 'test-helper';

test('esm preserves `import.meta.env.*` / `process.env.*` presets instead of inlining', async () => {
  const fixturePath = __dirname;
  const { restore } = proxyConsole('warn');
  const { entries } = await buildAndGetResults({ fixturePath }).finally(
    restore,
  );

  // Rsbuild would inline these presets (e.g. MODE -> "production").
  // Rslib keeps them as-is so the downstream consumer can replace them.
  expect(entries.esm).toContain('import.meta.env.MODE');
  expect(entries.esm).toContain('import.meta.env.DEV');
  expect(entries.esm).toContain('import.meta.env.PROD');
  expect(entries.esm).toContain('import.meta.env.SSR');
  expect(entries.esm).toContain('import.meta.env.BASE_URL');
  expect(entries.esm).toContain('import.meta.env.ASSET_PREFIX');
  expect(entries.esm).toContain('import.meta.env.MY_CUSTOM');
  expect(entries.esm).toContain('process.env.BASE_URL');
  expect(entries.esm).toContain('process.env.ASSET_PREFIX');
  expect(entries.esm).toContain('process.env.MY_CUSTOM');
});

test('cjs preserves `process.env.*` and replaces `import.meta.env.*` with undefined', async () => {
  const fixturePath = __dirname;
  const { restore } = proxyConsole('warn');
  const { entries } = await buildAndGetResults({ fixturePath }).finally(
    restore,
  );

  // `import.meta` is a syntax error in CJS, so it cannot be preserved. Rspack
  // replaces unknown properties with `undefined`.
  expect(entries.cjs).not.toContain('import.meta.env');
  expect(entries.cjs).not.toContain('"production"');
  expect(entries.cjs).toContain('const env = void 0;');
  expect(entries.cjs).toContain('const mode = (void 0).MODE;');
  expect(entries.cjs).toContain('const prod = (void 0).PROD;');
  expect(entries.cjs).toContain('const ssr = (void 0).SSR;');
  expect(entries.cjs).toContain('const assetPrefix = (void 0).ASSET_PREFIX;');
  expect(entries.cjs).toContain('const custom = (void 0).MY_CUSTOM;');
  // `process.env.*` access stays valid in CJS, so it is preserved.
  expect(entries.cjs).toContain('process.env.BASE_URL');
  expect(entries.cjs).toContain('process.env.ASSET_PREFIX');
  expect(entries.cjs).toContain('process.env.MY_CUSTOM');
});

// Rspack has temporarily reverted the warning emitted when an unknown
// `import.meta` property is replaced with `undefined`. Re-enable once that
// warning is reinstated upstream.
// rslint-disable-next-line rstest/no-disabled-tests
test.skip('cjs warns about unknown `import.meta` properties', async () => {
  const fixturePath = __dirname;
  const { logs, restore } = proxyConsole('warn');
  await buildAndGetResults({ fixturePath }).finally(restore);

  const warnings = logs.map(stripAnsi).join('\n');
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env.MODE' is replaced with undefined.",
  );
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env.PROD' is replaced with undefined.",
  );
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env.SSR' is replaced with undefined.",
  );
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env.ASSET_PREFIX' is replaced with undefined.",
  );
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env.MY_CUSTOM' is replaced with undefined.",
  );
  expect(warnings).toContain(
    "Accessing unknown `import.meta` property 'env' is replaced with undefined.",
  );
});

test('umd keeps Rsbuild default inlining', async () => {
  const fixturePath = __dirname;
  const { restore } = proxyConsole('warn');
  const { entries } = await buildAndGetResults({ fixturePath }).finally(
    restore,
  );

  // umd is a self-contained bundle, there is no downstream bundler to replace
  // the presets, so they stay inlined as literals.
  expect(entries.umd).not.toContain('import.meta.env');
  expect(entries.umd).toContain('"production"');
  expect(entries.umd).toContain('const prod = true;');
  expect(entries.umd).toContain('const ssr = false;');
  expect(entries.umd).toContain('const assetPrefix = "";');
  expect(entries.umd).toContain('}.MY_CUSTOM;');
  expect(entries.umd).not.toContain('process.env.BASE_URL');
  expect(entries.umd).not.toContain('process.env.ASSET_PREFIX');
  // Keys outside Rsbuild's presets are left untouched, as before.
  expect(entries.umd).toContain('process.env.MY_CUSTOM');
});

test('user source.define overrides Rslib env presets', async () => {
  const fixturePath = __dirname;
  const { restore } = proxyConsole('warn');
  const { entries } = await buildAndGetResults({
    fixturePath,
    configPath: './rslib.override.config.ts',
  }).finally(restore);

  expect(entries.esm).toContain('"custom-mode"');
  expect(entries.esm).not.toContain('import.meta.env.MODE');
  expect(entries.cjs).toContain('"custom-cjs-mode"');
  expect(entries.cjs).not.toContain('import.meta.env.MODE');

  for (const format of ['esm', 'cjs', 'umd'] as const) {
    expect(entries[format]).toContain('"/custom/"');
    expect(entries[format]).not.toContain('process.env.BASE_URL');
  }
});
