import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

describe('minify config', () => {
  test('tree shaking is enabled by default, bar and baz should be shaken, some comments and annotations are preserved', async () => {
    const fixturePath = join(__dirname, 'default');
    const { entries } = await buildAndGetResults({ fixturePath });
    expect(entries.esm).toMatchInlineSnapshot(`
      "/*! For license information please see index.js.LICENSE.txt */
      import { jsx } from "react/jsx-runtime";
      /*! Legal Comment */ const foo = ()=>{};
      const Button = ()=>/*#__PURE__*/ jsx('button', {});
      export { Button, foo };
      "
    `);
  });

  test('minify is disabled, nothing will be stripped', async () => {
    const fixturePath = join(__dirname, 'config/disabled');
    const { entries } = await buildAndGetResults({ fixturePath });
    expect(entries.esm).toMatchInlineSnapshot(`
      "import { jsx } from "react/jsx-runtime";

      ;// CONCATENATED MODULE: external "react/jsx-runtime"

      ;// CONCATENATED MODULE: ../../__fixtures__/src/index.ts
      /*! Legal Comment */ 
      const foo = ()=>{};
      const bar = ()=>{};
      const baz = ()=>{
          return bar();
      };
      // normal comment
      const Button = ()=>/*#__PURE__*/ jsx('button', {});

      export { Button, foo };
      "
    `);
  });

  test('minify is enabled, only preserve some comments and annotations', async () => {
    const fixturePath = join(__dirname, 'config/enabled');
    const { entries } = await buildAndGetResults({ fixturePath });
    expect(entries.esm).toMatchInlineSnapshot(`
      "/*! For license information please see index.js.LICENSE.txt */
      import{jsx as t}from"react/jsx-runtime";/*! Legal Comment */let o=()=>{},r=()=>/*#__PURE__*/t("button",{});export{r as Button,o as foo};"
    `);
  });
});

describe('minify config (mf)', () => {
  test('minify is enabled by default in mf format, bar and baz should be shaken, some comments and annotations are preserved', async () => {
    const fixturePath = join(__dirname, 'mf/default');
    const { mfExposeEntry } = await buildAndGetResults({ fixturePath });
    // biome-ignore format: snapshot
    expect(mfExposeEntry).toMatchInlineSnapshot(`
      "/*! For license information please see __federation_expose_default_export.js.LICENSE.txt */
      "use strict";(globalThis["default_minify"]=globalThis["default_minify"]||[]).push([["525"],{233:function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__);__webpack_require__.d(__webpack_exports__,{Button:()=>Button,foo:()=>foo});var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(491);/*! Legal Comment */const foo=()=>{};const Button=()=>/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button",{})}}]);"
    `);
  });

  test('minify is disabled by the user, nothing not be stripped', async () => {
    const fixturePath = join(__dirname, 'mf/config');
    const { mfExposeEntry } = await buildAndGetResults({ fixturePath });

    expect(mfExposeEntry).toMatchInlineSnapshot(`
      ""use strict";
      (globalThis["disable_minify"] = globalThis["disable_minify"] || []).push([["525"], {
      233: (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        Button: () => (Button),
        foo: () => (foo)
      });
      /* ESM import */var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(491);
      /* ESM import */var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
      /*! Legal Comment */ 
      const foo = ()=>{};
      const bar = ()=>{};
      const baz = ()=>{
          return bar();
      };
      // normal comment
      const Button = ()=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)('button', {});


      }),

      }]);"
    `);
  });
});
