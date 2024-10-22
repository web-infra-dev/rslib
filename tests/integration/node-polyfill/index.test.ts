import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('`Buffer` should be imported from polyfill when bundled', async () => {
  const fixturePath = join(__dirname, './bundle');
  const { entries, entryFiles } = await buildAndGetResults({ fixturePath });
  const bufferRegex =
    /var .* = __webpack_require__\(".*\/node_modules\/buffer\/index\.js"\)\["Buffer"\]/g;

  for (const format of ['esm', 'cjs'] as const) {
    expect(entries[format].match(bufferRegex)?.length).toBe(2);
    const buffer = (await import(entryFiles[format])).value1;
    expect(buffer.toString()).toEqual('value');
  }
});

test('`Buffer` should be aliased to polyfill packages when bundle is disabled', async () => {
  const fixturePath = join(__dirname, './bundle-false');
  const { contents, files } = await buildAndGetResults({ fixturePath });

  const bufferContents = Object.entries(contents.esm)
    .filter(([filename]) => {
      return /buffer\d\.js$/.test(filename);
    })
    .map(([_, content]) => content);

  for (const content of bufferContents) {
    expect(content).toContain(
      'module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("buffer")',
    );
  }

  const bufferFiles = files.esm.filter((filename) => {
    return /buffer\d\.js$/.test(filename);
  });

  await Promise.all(
    bufferFiles.map(async (filename) => {
      const buffer = (await import(filename)).value;
      expect(buffer.toString()).toBe('value');
    }),
  );
});
