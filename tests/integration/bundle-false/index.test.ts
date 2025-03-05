import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('basic', async () => {
  const fixturePath = join(__dirname, 'basic');
  const { files, contents } = await buildAndGetResults({ fixturePath });

  // ESM
  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/dep.js",
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
      "added": 3,
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

  const { content: indexContent } = queryContent(contents.esm, 'index.js', {
    basename: true,
  });
  const { content: depContent } = queryContent(contents.esm, 'dep.js', {
    basename: true,
  });
  const { content: sumContent } = queryContent(contents.esm, 'sum.js', {
    basename: true,
  });
  expect(indexContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE__mainFiles1_index_js_c28bc628__ from "./mainFiles1/index.js";
    import * as __WEBPACK_EXTERNAL_MODULE__dep_js_6cc8d1bf__ from "./dep.js";
    export * from "./mainFiles2/index.js";
    export * from "./utils/numbers.js";
    export * from "./utils/strings.js";
    export * from "./sum.js";
    var __webpack_exports__added = __WEBPACK_EXTERNAL_MODULE__dep_js_6cc8d1bf__.added;
    var __webpack_exports__mainFiles1 = __WEBPACK_EXTERNAL_MODULE__mainFiles1_index_js_c28bc628__.mainFiles1;
    export { __webpack_exports__added as added, __webpack_exports__mainFiles1 as mainFiles1 };
    "
  `);
  expect(depContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_dep_add__ from "dep_add";
    const added = (0, __WEBPACK_EXTERNAL_MODULE_dep_add__.add)(1, 2);
    export { added };
    "
  `);
  expect(sumContent).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE__utils_numbers_js_ac3baff3__ from "./utils/numbers.js";
    import * as __WEBPACK_EXTERNAL_MODULE__utils_strings_js_56d354bf__ from "./utils/strings.js";
    const numSum = __WEBPACK_EXTERNAL_MODULE__utils_numbers_js_ac3baff3__.num1 + __WEBPACK_EXTERNAL_MODULE__utils_numbers_js_ac3baff3__.num2 + __WEBPACK_EXTERNAL_MODULE__utils_numbers_js_ac3baff3__.num3;
    const strSum = __WEBPACK_EXTERNAL_MODULE__utils_strings_js_56d354bf__.str1 + __WEBPACK_EXTERNAL_MODULE__utils_strings_js_56d354bf__.str2 + __WEBPACK_EXTERNAL_MODULE__utils_strings_js_56d354bf__.str3;
    export { numSum, strSum };
    "
  `);

  // CJS
  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/dep.cjs",
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
      "added": 3,
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

test('monorepo', async () => {
  const fixturePath = join(__dirname, 'monorepo/importer');
  const { contents } = await buildAndGetResults({ fixturePath });
  expect(
    queryContent(contents.esm, 'index.js', {
      basename: true,
    }).content,
  ).toMatchInlineSnapshot(`
    "import * as __WEBPACK_EXTERNAL_MODULE_bundle_false_monorepo_importee_test_35ca595f__ from "bundle-false-monorepo-importee-test";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE_bundle_false_monorepo_importee_test_35ca595f__["default"];
    export { src_rslib_entry_ as default };
    "
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
    "import image_rslib_entry_namespaceObject from "../static/image/image.png";
    export { image_rslib_entry_namespaceObject as default };
    "
  `);
  expect(Object.values(contents.esm)[1]).toMatchInlineSnapshot(`
    "import logo_rslib_entry_namespaceObject from "../static/svg/logo.svg";
    export { logo_rslib_entry_namespaceObject as default };
    "
  `);
  expect(Object.values(contents.cjs)[0]).toMatchInlineSnapshot(`
    ""use strict";
    var __webpack_modules__ = {
        "./src/assets/image.png?__rslib_entry__": function(module) {
            module.exports = require("../static/image/image.png");
        }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        return module.exports;
    }
    var __webpack_exports__ = __webpack_require__("./src/assets/image.png?__rslib_entry__");
    exports["default"] = __webpack_exports__["default"];
    for(var __webpack_i__ in __webpack_exports__)if (-1 === [
        "default"
    ].indexOf(__webpack_i__)) exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    "
  `);
  expect(Object.values(contents.cjs)[1]).toMatchInlineSnapshot(`
    ""use strict";
    var __webpack_modules__ = {
        "./src/assets/logo.svg?__rslib_entry__": function(module) {
            module.exports = require("../static/svg/logo.svg");
        }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        return module.exports;
    }
    var __webpack_exports__ = __webpack_require__("./src/assets/logo.svg?__rslib_entry__");
    exports["default"] = __webpack_exports__["default"];
    for(var __webpack_i__ in __webpack_exports__)if (-1 === [
        "default"
    ].indexOf(__webpack_i__)) exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
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
