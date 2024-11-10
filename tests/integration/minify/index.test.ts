import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('tree shaking is enabled by default, bar and baz should be shaken', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entries } = await buildAndGetResults({ fixturePath });
  expect(entries.esm).toMatchInlineSnapshot(`
    "const foo = ()=>{};
    export { foo };
    "
  `);
});

test('tree shaking is disabled by the user, bar and baz should be kept', async () => {
  const fixturePath = join(__dirname, 'config');
  const { entries } = await buildAndGetResults({ fixturePath });
  expect(entries.esm).toMatchInlineSnapshot(`
    "const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
      return typeof document === 'undefined'
        ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
        : (document.currentScript && document.currentScript.src) ||
          new URL('main.js', document.baseURI).href;
    })();

    ;// CONCATENATED MODULE: ../__fixtures__/src/index.ts?__rslib_entry__
    const foo = ()=>{};
    const bar = ()=>{};
    const baz = ()=>{
        return bar();
    };

    export { foo };
    "
  `);
});

test('minify is enabled by default in mf format, bar and baz should be minified', async () => {
  const fixturePath = join(__dirname, 'mf/default');
  const { mfExposeEntry } = await buildAndGetResults({ fixturePath });
  // biome-ignore format: snapshot
  expect(mfExposeEntry).toMatchInlineSnapshot(`""use strict";(globalThis["default_minify"]=globalThis["default_minify"]||[]).push([["249"],{"../../__fixtures__/src/index.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__);__webpack_require__.d(__webpack_exports__,{foo:function(){return foo}});const foo=()=>{}}}]);"`);
});

test('minify is disabled by the user, bar and baz should not be minified', async () => {
  const fixturePath = join(__dirname, 'mf/config');
  const { mfExposeEntry } = await buildAndGetResults({ fixturePath });
  expect(mfExposeEntry).toMatchInlineSnapshot(`
    ""use strict";
    (globalThis['disable_minify'] = globalThis['disable_minify'] || []).push([["249"], {
    "../../__fixtures__/src/index.ts": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      foo: function() { return foo; }
    });
    const foo = ()=>{};
    const bar = ()=>{};
    const baz = ()=>{
        return bar();
    };


    }),

    }]);"
  `);
});
