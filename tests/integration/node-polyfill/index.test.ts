import { basename, join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

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
      return /^\d+\.js$/.test(basename(filename));
    })
    .map(([_, content]) => content);

  expect(bufferContents).toMatchInlineSnapshot(`
    [
      "import { createRequire as __rspack_createRequire } from "node:module";
    const __rspack_createRequire_require = __rspack_createRequire(import.meta.url);
    import { __webpack_require__ } from "./rslib-runtime.js";
    __webpack_require__.add({
        "<ROOT>/node_modules/<PNPM_INNER>/buffer/index.js" (module) {
            module.exports = __rspack_createRequire_require("buffer");
        }
    });
    ",
    ]
  `);

  const bufferFiles = files.esm.filter((filename) => {
    return /^buffer\d\.js$/.test(basename(filename));
  });

  expect(bufferFiles).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/node-polyfill/bundle-false/dist/esm/bundleless/buffer1.js",
      "<ROOT>/tests/integration/node-polyfill/bundle-false/dist/esm/bundleless/buffer2.js",
    ]
  `);

  await Promise.all(
    bufferFiles.map(async (filename) => {
      const buffer = (await import(filename)).value;
      expect(buffer.toString()).toBe('value');
    }),
  );
});
