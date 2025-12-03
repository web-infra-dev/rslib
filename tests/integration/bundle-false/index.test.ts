import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

test('basic', async () => {
  const fixturePath = join(__dirname, 'basic');
  const { files, contents } = await buildAndGetResults({ fixturePath });

  // ESM
  expect(files.esm).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/.hidden-folder/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/.hidden.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/dep.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/mainFiles1/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/mainFiles2/index.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/sum.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/utils/numbers.js",
      "<ROOT>/tests/integration/bundle-false/basic/dist/esm/utils/strings.js",
    ]
  `);

  const { path: esmIndexPath } = queryContent(contents.esm, /esm\/index\.js/);

  expect(await import(esmIndexPath)).toMatchInlineSnapshot(`
    {
      "added": 3,
      "hidden": "This is a hidden file",
      "hiddenFolder": "This is a hidden folder",
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

  const { content: indexContent } = queryContent(
    contents.esm,
    /esm\/index\.js/,
  );
  const { content: depContent } = queryContent(contents.esm, 'dep.js', {
    basename: true,
  });
  const { content: sumContent } = queryContent(contents.esm, 'sum.js', {
    basename: true,
  });
  expect(indexContent).toMatchInlineSnapshot(`
    "import { mainFiles1 } from "./mainFiles1/index.js";
    import { added } from "./dep.js";
    export * from "./.hidden.js";
    export * from "./.hidden-folder/index.js";
    export * from "./mainFiles2/index.js";
    export * from "./sum.js";
    export * from "./utils/numbers.js";
    export * from "./utils/strings.js";
    export { added, mainFiles1 };
    "
  `);
  expect(depContent).toMatchInlineSnapshot(`
    "import dep_add from "dep_add";
    const added = dep_add.add(1, 2);
    export { added };
    "
  `);
  expect(sumContent).toMatchInlineSnapshot(`
    "import { num1, num2, num3 } from "./utils/numbers.js";
    import { str1, str2, str3 } from "./utils/strings.js";
    const numSum = num1 + num2 + num3;
    const strSum = str1 + str2 + str3;
    export { numSum, strSum };
    "
  `);

  // CJS
  expect(files.cjs).toMatchInlineSnapshot(`
    [
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/.hidden-folder/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/.hidden.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/dep.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/mainFiles1/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/mainFiles2/index.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/sum.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/utils/numbers.cjs",
      "<ROOT>/tests/integration/bundle-false/basic/dist/cjs/utils/strings.cjs",
    ]
  `);

  const { path: cjsIndexPath } = queryContent(contents.cjs, /cjs\/index\.cjs/);

  expect((await import(cjsIndexPath)).default).toMatchInlineSnapshot(`
    {
      "added": 3,
      "hidden": "This is a hidden file",
      "hiddenFolder": "This is a hidden folder",
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
    "import bundle_false_monorepo_importee_test from "bundle-false-monorepo-importee-test";
    const src = bundle_false_monorepo_importee_test;
    export { src as default };
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
    'import { baz } from "./baz.js.js";',
    'import { baz } from "./baz.js.js";',
    'import { foo } from "./foo.js";',
    'import { qux } from "./qux.js";',
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
    'import { bar } from "./bar.mjs";',
    'import { baz } from "./baz.js.mjs";',
    'import { foo } from "./foo.mjs";',
    'import { qux } from "./qux.mjs";',
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
    "import image_namespaceObject from "../static/image/image.png";
    export { image_namespaceObject as default };
    "
  `);
  expect(Object.values(contents.esm)[1]).toMatchInlineSnapshot(`
    "import logo_namespaceObject from "../static/svg/logo.svg";
    export { logo_namespaceObject as default };
    "
  `);
  expect(Object.values(contents.cjs)[0]).toMatchInlineSnapshot(`
    ""use strict";
    var __webpack_modules__ = {
        "./src/assets/image.png" (module) {
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
    var __webpack_exports__ = __webpack_require__("./src/assets/image.png");
    exports["default"] = __webpack_exports__["default"];
    for(var __rspack_i in __webpack_exports__)if (-1 === [
        "default"
    ].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    "
  `);
  expect(Object.values(contents.cjs)[1]).toMatchInlineSnapshot(`
    ""use strict";
    var __webpack_modules__ = {
        "./src/assets/logo.svg" (module) {
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
    var __webpack_exports__ = __webpack_require__("./src/assets/logo.svg");
    exports["default"] = __webpack_exports__["default"];
    for(var __rspack_i in __webpack_exports__)if (-1 === [
        "default"
    ].indexOf(__rspack_i)) exports[__rspack_i] = __webpack_exports__[__rspack_i];
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
