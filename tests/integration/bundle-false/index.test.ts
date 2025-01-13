import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('basic', async () => {
  const fixturePath = join(__dirname, 'basic');
  const { files, contents } = await buildAndGetResults({ fixturePath });

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/mainFiles1/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/mainFiles2/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/sum.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/utils/numbers.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/utils/strings.js",
    ]
  `);

  const { path: esmIndexPath } = queryContent(contents.esm, 'index.js', {
    basename: true,
  });

  expect(await import(esmIndexPath)).toMatchInlineSnapshot(`
    {
      "mainFiles1": "mainFiles1",
      "mainFiles2": "mainFiles2",
      "num1": 1,
      "num2": 2,
      "num3": 3,
      "numSum": 6,
      "str1": "str1",
      "str2": "str2",
      "str3": "str3",
      "strSum": "str1str2str3",
    }
  `);

  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/mainFiles1/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/mainFiles2/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/sum.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/utils/numbers.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/utils/strings.cjs",
    ]
  `);

  const { path: cjsIndexPath } = queryContent(contents.cjs, 'index.cjs', {
    basename: true,
  });

  expect((await import(cjsIndexPath)).default).toMatchInlineSnapshot(`
    {
      "mainFiles1": "mainFiles1",
      "mainFiles2": "mainFiles2",
      "num1": 1,
      "num2": 2,
      "num3": 3,
      "numSum": 6,
      "str1": "str1",
      "str2": "str2",
      "str3": "str3",
      "strSum": "str1str2str3",
    }
  `);
});

test('single file', async () => {
  const fixturePath = join(__dirname, 'single-file');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/single-file/dist/esm/index.js",
    ]
  `);
  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/single-file/dist/cjs/index.cjs",
    ]
  `);
});

test('auto add js extension for relative import', async () => {
  const fixturePath = join(__dirname, 'js-extension');
  const { contents } = await buildAndGetResults({ fixturePath });

  // basic esm
  for (const importer of [
    'import * as __WEBPACK_EXTERNAL_MODULE__bar_js_69b41beb__ from "./bar.js";',
    'import * as __WEBPACK_EXTERNAL_MODULE__baz_js_js_7d4e15b7__ from "./baz.js.js";',
    'import * as __WEBPACK_EXTERNAL_MODULE__foo_js_fdf5aa2d__ from "./foo.js";',
    'import * as __WEBPACK_EXTERNAL_MODULE__qux_js_3d9e4fc9__ from "./qux.js";',
  ]) {
    expect(Object.values(contents.esm0!)[3]).toContain(importer);
  }

  // basic cjs
  for (const requirer of [
    'const external_bar_cjs_namespaceObject = require("./bar.cjs");',
    'const external_baz_js_cjs_namespaceObject = require("./baz.js.cjs");',
    'const external_foo_cjs_namespaceObject = require("./foo.cjs");',
    'const external_qux_cjs_namespaceObject = require("./qux.cjs");',
  ]) {
    expect(Object.values(contents.cjs0!)[3]).toContain(requirer);
  }

  // using `autoExtension: false` along with `output.filename.js` - esm
  for (const importer of [
    'import * as __WEBPACK_EXTERNAL_MODULE__bar_mjs_89c909f2__ from "./bar.mjs";',
    'import * as __WEBPACK_EXTERNAL_MODULE__baz_js_mjs_09565ba6__ from "./baz.js.mjs";',
    'import * as __WEBPACK_EXTERNAL_MODULE__foo_mjs_ccdcdd01__ from "./foo.mjs";',
    'import * as __WEBPACK_EXTERNAL_MODULE__qux_mjs_83952e37__ from "./qux.mjs";',
  ]) {
    expect(Object.values(contents.esm1!)[3]).toContain(importer);
  }

  // using `autoExtension: false` along with `output.filename.js` - cjs
  for (const requirer of [
    'const external_bar_cjs_namespaceObject = require("./bar.cjs");',
    'const external_baz_js_cjs_namespaceObject = require("./baz.js.cjs");',
    'const external_foo_cjs_namespaceObject = require("./foo.cjs");',
    'const external_qux_cjs_namespaceObject = require("./qux.cjs");',
  ]) {
    expect(Object.values(contents.cjs1!)[3]).toContain(requirer);
  }
});

test('asset in bundleless', async () => {
  const fixturePath = join(__dirname, 'asset');
  const { contents } = await buildAndGetResults({ fixturePath });

  expect(Object.values(contents.esm)[0]).toMatchInlineSnapshot(`
    "import __rslib_asset__ from '../static/image/image.png';
    export default __rslib_asset__;
    "
  `);
  expect(Object.values(contents.esm)[1]).toMatchInlineSnapshot(`
    "import __rslib_asset__ from '../static/svg/logo.svg';
    export default __rslib_asset__;
    "
  `);
  expect(Object.values(contents.cjs)[0]).toMatchInlineSnapshot(`
    "module.exports = require('../static/image/image.png');
    "
  `);
  expect(Object.values(contents.cjs)[1]).toMatchInlineSnapshot(`
    "module.exports = require('../static/svg/logo.svg');
    "
  `);
});

test('svgr in bundleless', async () => {
  const fixturePath = join(__dirname, 'svgr');
  const { contents } = await buildAndGetResults({ fixturePath });

  // TODO: import "react"; in output now, we should shake this
  expect(Object.values(contents.esm)[0]).toMatchSnapshot();
  expect(Object.values(contents.cjs)[0]).toMatchSnapshot();
});
