import { platform } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

// '__file' path can't be normalized on win32.
describe.runIf(platform() !== 'win32')('ESM', async () => {
  const fixturePath = join(__dirname);
  const { js, css } = await buildAndGetResults({
    fixturePath,
    type: 'all',
  });
  test('bundle', async () => {
    if (process.env.ADVANCED_ESM) {
      expect(js.contents.esm1).toMatchInlineSnapshot(`
        {
          "<ROOT>/tests/integration/vue/dist/bundle/index.js": "import "./runtime.js";
        import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
        const _00_2Fplugin_vue_2Fexport_helper = (sfc, props)=>{
            const target = sfc.__vccOpts || sfc;
            for (const [key, val] of props)target[key] = val;
            return target;
        };
        const _sfc_main = {
            __name: 'Button',
            setup (__props, { expose: __expose }) {
                __expose();
                const button = ref('Button!');
                const __returned__ = {
                    button,
                    ref: ref
                };
                Object.defineProperty(__returned__, '__isScriptSetup', {
                    enumerable: false,
                    value: true
                });
                return __returned__;
            }
        };
        const _hoisted_1 = {
            class: "component button"
        };
        function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
            return openBlock(), createElementBlock("p", _hoisted_1, toDisplayString($setup.button), 1);
        }
        const Button = /*#__PURE__*/ _00_2Fplugin_vue_2Fexport_helper(_sfc_main, [
            [
                'render',
                _sfc_render
            ],
            [
                '__file',
                "<ROOT>/tests/integration/vue/src/Button/Button.vue"
            ]
        ]);
        const Card_sfc_main = {
            __name: 'Card',
            setup (__props, { expose: __expose }) {
                __expose();
                const card = ref('Card!');
                const __returned__ = {
                    card,
                    ref: ref
                };
                Object.defineProperty(__returned__, '__isScriptSetup', {
                    enumerable: false,
                    value: true
                });
                return __returned__;
            }
        };
        const Card_hoisted_1 = {
            class: "component card"
        };
        function Card_sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
            return openBlock(), createElementBlock("p", Card_hoisted_1, toDisplayString($setup.card), 1);
        }
        const Card = /*#__PURE__*/ _00_2Fplugin_vue_2Fexport_helper(Card_sfc_main, [
            [
                'render',
                Card_sfc_render
            ],
            [
                '__file',
                "<ROOT>/tests/integration/vue/src/Card.vue"
            ]
        ]);
        export { Button, Card };
        ",
          "<ROOT>/tests/integration/vue/dist/bundle/runtime.js": "var __webpack_modules__ = {};
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
    } else {
      expect(js.contents.esm1).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundle/index.js": "import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
      const _00_2Fplugin_vue_2Fexport_helper = (sfc, props)=>{
          const target = sfc.__vccOpts || sfc;
          for (const [key, val] of props)target[key] = val;
          return target;
      };
      const _sfc_main = {
          __name: 'Button',
          setup (__props, { expose: __expose }) {
              __expose();
              const button = ref('Button!');
              const __returned__ = {
                  button,
                  ref: ref
              };
              Object.defineProperty(__returned__, '__isScriptSetup', {
                  enumerable: false,
                  value: true
              });
              return __returned__;
          }
      };
      const _hoisted_1 = {
          class: "component button"
      };
      function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
          return openBlock(), createElementBlock("p", _hoisted_1, toDisplayString($setup.button), 1);
      }
      const Button = /*#__PURE__*/ _00_2Fplugin_vue_2Fexport_helper(_sfc_main, [
          [
              'render',
              _sfc_render
          ],
          [
              '__file',
              "<ROOT>/tests/integration/vue/src/Button/Button.vue"
          ]
      ]);
      const Card_sfc_main = {
          __name: 'Card',
          setup (__props, { expose: __expose }) {
              __expose();
              const card = ref('Card!');
              const __returned__ = {
                  card,
                  ref: ref
              };
              Object.defineProperty(__returned__, '__isScriptSetup', {
                  enumerable: false,
                  value: true
              });
              return __returned__;
          }
      };
      const Card_hoisted_1 = {
          class: "component card"
      };
      function Card_sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
          return openBlock(), createElementBlock("p", Card_hoisted_1, toDisplayString($setup.card), 1);
      }
      const Card = /*#__PURE__*/ _00_2Fplugin_vue_2Fexport_helper(Card_sfc_main, [
          [
              'render',
              Card_sfc_render
          ],
          [
              '__file',
              "<ROOT>/tests/integration/vue/src/Card.vue"
          ]
      ]);
      export { Button, Card };
      ",
      }
    `);
    }

    expect(css.contents.esm1).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundle/index.css": ".button.component {
        color: #428bca;
        border-radius: .5rem;
      }

      .button {
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
    expect(js.contents.esm0).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/Button.js": "import "./style.css";
      import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
      const _00_2Fplugin_vue_2Fexport_helper = (sfc, props)=>{
          const target = sfc.__vccOpts || sfc;
          for (const [key, val] of props)target[key] = val;
          return target;
      };
      const _sfc_main = {
          __name: 'Button',
          setup (__props, { expose: __expose }) {
              __expose();
              const button = ref('Button!');
              const __returned__ = {
                  button,
                  ref: ref
              };
              Object.defineProperty(__returned__, '__isScriptSetup', {
                  enumerable: false,
                  value: true
              });
              return __returned__;
          }
      };
      const _hoisted_1 = {
          class: "component button"
      };
      function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
          return openBlock(), createElementBlock("p", _hoisted_1, toDisplayString($setup.button), 1);
      }
      const Button = /*#__PURE__*/ _00_2Fplugin_vue_2Fexport_helper(_sfc_main, [
          [
              'render',
              _sfc_render
          ],
          [
              '__file',
              "<ROOT>/tests/integration/vue/src/Button/Button.vue"
          ]
      ]);
      export { Button as default };
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/index.js": "import Button from "./Button.js";
      export { Button as default };
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/Card.js": "import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
      const _00_2Fplugin_vue_2Fexport_helper = (sfc, props)=>{
          const target = sfc.__vccOpts || sfc;
          for (const [key, val] of props)target[key] = val;
          return target;
      };
      const _sfc_main = {
          __name: 'Card',
          setup (__props, { expose: __expose }) {
              __expose();
              const card = ref('Card!');
              const __returned__ = {
                  card,
                  ref: ref
              };
              Object.defineProperty(__returned__, '__isScriptSetup', {
                  enumerable: false,
                  value: true
              });
              return __returned__;
          }
      };
      const _hoisted_1 = {
          class: "component card"
      };
      function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
          return openBlock(), createElementBlock("p", _hoisted_1, toDisplayString($setup.card), 1);
      }
      const Card = /*#__PURE__*/ _00_2Fplugin_vue_2Fexport_helper(_sfc_main, [
          [
              'render',
              _sfc_render
          ],
          [
              '__file',
              "<ROOT>/tests/integration/vue/src/Card.vue"
          ]
      ]);
      export { Card as default };
      ",
        "<ROOT>/tests/integration/vue/dist/bundleless/index.js": "import Button from "./Button/index.js";
      import Card from "./Card.js";
      export { Button, Card };
      ",
      }
    `);
    expect(css.contents.esm0).toMatchInlineSnapshot(`
      {
        "<ROOT>/tests/integration/vue/dist/bundleless/Button/style.css": ".button.component {
        color: #428bca;
        border-radius: .5rem;
      }

      ",
      }
    `);
  });
});
