import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('esm preserves `import.meta.env.*` / `process.env.*` presets instead of inlining', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({ fixturePath });

  // Rsbuild would inline these presets (e.g. MODE -> "production").
  // Rslib keeps them as-is so the downstream consumer can replace them.
  expect(entries.esm).toContain('import.meta.env.MODE');
  expect(entries.esm).toContain('import.meta.env.DEV');
  expect(entries.esm).toContain('import.meta.env.BASE_URL');
  expect(entries.esm).toContain('process.env.BASE_URL');
  expect(entries.esm).toContain('process.env.MY_CUSTOM');
});

test('cjs preserves `process.env.*` and replaces unsupported `import.meta.env.*`', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({ fixturePath });

  // `import.meta` is invalid in CJS, so Rspack replaces the env object with an
  // empty object and unknown properties with `undefined`.
  expect(entries.cjs).not.toContain('import.meta.env');
  expect(entries.cjs).not.toContain('"production"');
  expect(entries.cjs).toContain('const mode = void 0');
  expect(entries.cjs).toContain('const env = {};');
  // `process.env.*` access stays valid in CJS, so it is preserved.
  expect(entries.cjs).toContain('process.env.BASE_URL');
  expect(entries.cjs).toContain('process.env.MY_CUSTOM');
});

test('umd keeps Rsbuild default inlining', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({ fixturePath });

  // umd is a self-contained bundle, presets are inlined into literals.
  expect(entries.umd).not.toContain('import.meta.env');
  expect(entries.umd).toContain('"production"');
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
