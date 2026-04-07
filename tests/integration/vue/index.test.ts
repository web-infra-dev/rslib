import { platform } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults, type BuildResult } from 'test-helper';

// '__file' path can't be normalized on win32.
describe.runIf(platform() !== 'win32')('ESM', async () => {
  let jsResult: BuildResult;
  let cssResult: BuildResult;

  beforeAll(async () => {
    const fixturePath = join(__dirname);
    const { js, css } = await buildAndGetResults({
      fixturePath,
      type: 'all',
    });
    jsResult = js;
    cssResult = css;
  });

  test('bundle', async () => {
    expect(jsResult.contents.esm1).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundle/index.js": "import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
      var __webpack_modules__ = {};
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
      __webpack_require__.add({
          "<PNPM_INNER>/rspack-vue-loader/dist/exportHelper.js" (__unused_rspack_module, exports) {
              exports.A = (sfc, props)=>{
                  const target = sfc.__vccOpts || sfc;
                  for (const [key, val] of props)target[key] = val;
                  return target;
              };
          }
      });
      const _hoisted_1 = {
          class: "component button"
      };
      const Buttonvue_type_script_setup_true_lang_js = {
          __name: 'Button',
          setup (__props) {
              const button = ref('Button!');
              return (_ctx, _cache)=>(openBlock(), createElementBlock("p", _hoisted_1, toDisplayString(button.value), 1));
          }
      };
      const exportHelper = __webpack_require__("<PNPM_INNER>/rspack-vue-loader/dist/exportHelper.js");
      const __exports__ = /*#__PURE__*/ (0, exportHelper.A)(Buttonvue_type_script_setup_true_lang_js, [
          [
              '__scopeId',
              "data-v-1e8aa170"
          ]
      ]);
      const Button = __exports__;
      const Cardvue_type_script_setup_true_lang_js_hoisted_1 = {
          class: "component card"
      };
      const Cardvue_type_script_setup_true_lang_js = {
          __name: 'Card',
          setup (__props) {
              const card = ref('Card!');
              return (_ctx, _cache)=>(openBlock(), createElementBlock("p", Cardvue_type_script_setup_true_lang_js_hoisted_1, toDisplayString(card.value), 1));
          }
      };
      const Card_exports_ = Cardvue_type_script_setup_true_lang_js;
      const Card = Card_exports_;
      export { Button, Card };
      ",
      }
    `);

    expect(cssResult.contents.esm1).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundle/index.css": ".button.component {
        color: #428bca;
        border-radius: .5rem;
      }

      .button[data-v-1e8aa170] {
        font-weight: bold;
      }

      .card {
        color: red;
        font-weight: bold;
      }

      ",
      }
    `);
  });

  test('bundleless', async () => {
    expect(jsResult.contents.esm0).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/Button.js": "import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
      import "./style.css";
      import "./Button.css";
      import { __webpack_require__ } from "../rslib-runtime.js";
      __webpack_require__.add({
          "<PNPM_INNER>/rspack-vue-loader/dist/exportHelper.js" (__unused_rspack_module, exports) {
              exports.A = (sfc, props)=>{
                  const target = sfc.__vccOpts || sfc;
                  for (const [key, val] of props)target[key] = val;
                  return target;
              };
          }
      });
      const _hoisted_1 = {
          class: "component button"
      };
      const Buttonvue_type_script_setup_true_lang_js = {
          __name: 'Button',
          setup (__props) {
              const button = ref('Button!');
              return (_ctx, _cache)=>(openBlock(), createElementBlock("p", _hoisted_1, toDisplayString(button.value), 1));
          }
      };
      const exportHelper = __webpack_require__("<PNPM_INNER>/rspack-vue-loader/dist/exportHelper.js");
      const __exports__ = /*#__PURE__*/ (0, exportHelper.A)(Buttonvue_type_script_setup_true_lang_js, [
          [
              '__scopeId',
              "data-v-1e8aa170"
          ]
      ]);
      const Button = __exports__;
      export default Button;
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/index.js": "export { default } from "./Button.js";
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/Card.js": "import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
      import "./Card.css";
      const _hoisted_1 = {
          class: "component card"
      };
      const Cardvue_type_script_setup_true_lang_js = {
          __name: 'Card',
          setup (__props) {
              const card = ref('Card!');
              return (_ctx, _cache)=>(openBlock(), createElementBlock("p", _hoisted_1, toDisplayString(card.value), 1));
          }
      };
      const __exports__ = Cardvue_type_script_setup_true_lang_js;
      const Card = __exports__;
      export default Card;
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/index.js": "export { default as Button } from "./Button/index.js";
      export { default as Card } from "./Card.js";
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/rslib-runtime.js": "var __webpack_modules__ = {};
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
      }
    `);
    expect(cssResult.contents.esm0).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/Button.css": ".button[data-v-1e8aa170] {
        font-weight: bold;
      }

      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/style.css": ".button.component {
        color: #428bca;
        border-radius: .5rem;
      }

      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/Card.css": ".card {
        color: red;
        font-weight: bold;
      }

      ",
      }
    `);
  });
});
