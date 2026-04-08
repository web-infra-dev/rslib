import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

test('resolve data url', async () => {
  const fixturePath = join(__dirname, 'data-url');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "const javascript_export_default_42 = 42;
    console.log('x:', javascript_export_default_42);
    export { };
    "
  `);
});

test('resolve false', async () => {
  const fixturePath = join(__dirname, 'false');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "var __webpack_modules__ = {};
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
    __webpack_require__.m = __webpack_modules__;
    (()=>{
        __webpack_require__.n = (module)=>{
            var getter = module && module.__esModule ? ()=>module['default'] : ()=>module;
            __webpack_require__.d(getter, {
                a: getter
            });
            return getter;
        };
    })();
    (()=>{
        __webpack_require__.d = (exports, definition)=>{
            for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
                enumerable: true,
                get: definition[key]
            });
        };
    })();
    (()=>{
        __webpack_require__.add = function(modules) {
            Object.assign(__webpack_require__.m, modules);
        };
    })();
    (()=>{
        __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    __webpack_require__.add({
        "?27ce" () {}
    });
    const util_ignored_ = __webpack_require__("?27ce");
    var util_ignored__default = /*#__PURE__*/ __webpack_require__.n(util_ignored_);
    console.log('foo:', util_ignored__default());
    console.log('bar: ', "bar");
    "
  `);
});

test('resolve node protocol', async () => {
  const fixturePath = join(__dirname, 'node-protocol');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
      "import node_path from "node:path";
      const { join: join } = node_path;
      export { join };
      "
    `);
});

test('resolve with condition exports', async () => {
  const fixturePath = join(__dirname, 'with-condition-exports');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });

  const nodeResults = Object.values(contents.esm0!);
  const browserResults = Object.values(contents.esm1!);

  expect(isSuccess).toBeTruthy();

  expect(nodeResults[1]).toContain('lib1 mjs');
  expect(nodeResults[2]).toContain('lib2 module');
  expect(nodeResults[3]).toContain('node');
  expect(nodeResults[4]).toContain('lib1 cjs');

  expect(browserResults[1]).toContain('lib1 mjs');
  expect(browserResults[2]).toContain('lib2 module');
  expect(browserResults[3]).toContain('browser');
  expect(browserResults[4]).toContain('lib1 cjs');
});

test('resolve with js extensions', async () => {
  const fixturePath = join(__dirname, 'with-js-extensions');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "console.log(1);
    export { };
    "
  `);
});

test('resolve with main fields', async () => {
  const fixturePath = join(__dirname, 'with-main-fields');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });
  const results = Object.values(contents);

  expect(isSuccess).toBeTruthy();
  expect(Object.values(results[0]!)[0]).toMatchInlineSnapshot(`
    "console.log(1);
    export { };
    "
  `);
  expect(Object.values(results[1]!)[0]).toContain('main');
  expect(Object.values(results[2]!)[0]).toContain('browser');
});
