import path from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test("API plugin's api should be skipped in parser", async () => {
  const fixturePath = path.resolve(__dirname);
  const { entries } = await buildAndGetResults({
    fixturePath,
  });

  expect(entries.esm).toMatchInlineSnapshot(`
		"const a = require.cache;
		const b = require.extensions;
		const c = require.config;
		const d = require.version;
		const e = require.include;
		const f = require.onError;
		export { a, b, c, d, e, f };
		"
	`);

  expect(entries.cjs).toContain('const a = require.cache;');
  expect(entries.cjs).toContain('const b = require.extensions;');
  expect(entries.cjs).toContain('const c = require.config;');
  expect(entries.cjs).toContain('const d = require.version;');
  expect(entries.cjs).toContain('const e = require.include;');
  expect(entries.cjs).toContain('const f = require.onError;');
});
