import path from 'node:path';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('redirect.js default', async () => {
  const fixturePath = path.resolve(__dirname, './js-not-resolve');
  const { logs } = proxyConsole();
  const contents = (await buildAndGetResults({ fixturePath, lib: ['esm0'] }))
    .contents;

  const logStrings = logs
    .map((log) => stripAnsi(log))
    .filter((log) => log.startsWith('warn'))
    .sort();

  expect(logStrings).toMatchInlineSnapshot(
    `
    [
      "warn    Failed to resolve module "./bar.js" from <ROOT>/tests/integration/redirect/js-not-resolve/src/index.js. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.",
      "warn    Failed to resolve module "./foo" from <ROOT>/tests/integration/redirect/js-not-resolve/src/index.js. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.",
      "warn    Failed to resolve module "lodash" from <ROOT>/tests/integration/redirect/js-not-resolve/src/index.js. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.",
    ]
  `,
  );

  const { content: indexContent } = queryContent(
    contents.esm0!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js__["default"]);
    export { src_rslib_entry_ as default };
    "
  `);
});

test('redirect.js.path false', async () => {
  const fixturePath = path.resolve(__dirname, './js-not-resolve');
  const { logs } = proxyConsole();
  const contents = (await buildAndGetResults({ fixturePath, lib: ['esm1'] }))
    .contents;

  const logStrings = logs
    .map((log) => stripAnsi(log))
    .filter((log) => log.startsWith('warn'));

  expect(logStrings.length).toBe(0);

  const { content: indexContent } = queryContent(
    contents.esm1!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo_js__ from "./foo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo_js__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js__["default"]);
    export { src_rslib_entry_ as default };
    "
  `);
});

test('redirect.js.extension: false', async () => {
  const fixturePath = path.resolve(__dirname, './js-not-resolve');
  const { logs } = proxyConsole();
  const contents = (await buildAndGetResults({ fixturePath, lib: ['esm2'] }))
    .contents;

  const logStrings = logs
    .map((log) => stripAnsi(log))
    .filter((log) => log.startsWith('warn'))
    .sort();

  expect(logStrings).toMatchInlineSnapshot(
    `
    [
      "warn    Failed to resolve module "./bar.js" from <ROOT>/tests/integration/redirect/js-not-resolve/src/index.js. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.",
      "warn    Failed to resolve module "./foo" from <ROOT>/tests/integration/redirect/js-not-resolve/src/index.js. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.",
      "warn    Failed to resolve module "lodash" from <ROOT>/tests/integration/redirect/js-not-resolve/src/index.js. If it's an npm package, consider adding it to dependencies or peerDependencies in package.json to make it externalized.",
    ]
  `,
  );

  const { content: indexContent } = queryContent(
    contents.esm2!,
    /esm\/index\.js/,
  );

  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_lodash__ from "lodash";
    import * as __WEBPACK_EXTERNAL_MODULE__bar_js__ from "./bar.js";
    import * as __WEBPACK_EXTERNAL_MODULE__foo__ from "./foo";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_lodash__["default"].toUpper(__WEBPACK_EXTERNAL_MODULE__foo__["default"] + __WEBPACK_EXTERNAL_MODULE__bar_js__["default"]);
    export { src_rslib_entry_ as default };
    "
  `);
});
