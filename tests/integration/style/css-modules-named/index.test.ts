import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';
import { expectFileContainContent } from 'test-helper/rstest';

test('should extract css-modules named export successfully in bundle', async () => {
  const fixturePath = join(__dirname, 'bundle');
  const { js, css } = await buildAndGetResults({
    fixturePath,
    type: 'all',
  });
  // cspell:disable
  expect(js.entries.cjs).toContain(`var _1 = "content-wrapper-iNtwbA";`);
  expect(css.entries.cjs).toMatchInlineSnapshot(`
    ".content-wrapper-iNtwbA {
      background-color: #fff;
    }

    "
  `);
  if (process.env.ADVANCED_ESM) {
    expect(js.entries.esm).toMatchInlineSnapshot(`
      "import "./runtime.js";
      var _1 = "content-wrapper-iNtwbA";
      const src_button = _1;
      export { src_button as button };
      "
    `);
  } else {
    expect(js.entries.esm).toMatchInlineSnapshot(
      `
      "var _1 = "content-wrapper-iNtwbA";
      const src_button = _1;
      export { src_button as button };
      "
    `,
    );
  }
  expect(css.entries.esm).toMatchInlineSnapshot(
    `
    ".content-wrapper-iNtwbA {
      background-color: #fff;
    }

    "
  `,
  );
  // cspell:enable
});

test('should extract css-modules named export successfully in bundle-false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const result = await buildAndGetResults({ fixturePath, type: 'all' });

  const jsContents = result.js.contents;
  const cssContents = result.css.contents;

  // cspell:disable
  expect(Object.keys(cssContents.esm)).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules-named/bundle-false/dist/esm/button/index_module.css",
    ]
  `);
  expectFileContainContent(
    jsContents.esm,
    'button/index.module.js',
    `import "./index_module.css";
var _1 = "content-wrapper-iNtwbA";
export { _1 as contentWrapper };`,
  );

  expect(Object.keys(cssContents.cjs)).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/style/css-modules-named/bundle-false/dist/cjs/button/index_module.css",
    ]
  `);
  expectFileContainContent(
    jsContents.cjs,
    'button/index.module.cjs',
    `__webpack_require__.d(__webpack_exports__, {
    contentWrapper: ()=>_1
});
require("./index_module.css");
var _1 = "content-wrapper-iNtwbA";
exports.contentWrapper = __webpack_exports__.contentWrapper;`,
  );
  // cspell:enable
});
