import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

test('new Worker(new URL(...)) should be preserved', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = __dirname;
  const { contents } = await buildAndGetResults({
    fixturePath,
  });

  expect(contents.esm).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/worker/dist/esm/index.js": "const worker = new Worker(new URL('./worker.js', import.meta.url), {
        name: 'my-worker'
    });
    export { worker };
    ",
      "<ROOT>/tests/integration/worker/dist/esm/runtime.js": "var __webpack_modules__ = {};
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
        __webpack_require__.add = function(modules) {
            Object.assign(__webpack_require__.m, modules);
        };
    })();
    export { __webpack_require__ };
    ",
      "<ROOT>/tests/integration/worker/dist/esm/worker.js": "import { __webpack_require__ } from "./runtime.js";
    __webpack_require__.add({
        "./src/worker.ts": function() {
            console.log('Hello from worker', self.name);
        }
    });
    __webpack_require__("./src/worker.ts");
    ",
    }
  `);

  expect(queryContent(contents.cjs, /\/index\.js/).content).toContain(
    "new Worker(new URL('./worker.js', __rslib_import_meta_url__)",
  );
});
