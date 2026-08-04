import { beforeAll, describe, expect, test } from '@rstest/core';
import { platform } from 'node:os';
import { join } from 'node:path';
import { buildAndGetResults, type BuildResult } from 'test-helper';

const normalizeVueModuleIds = (contents: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(contents).map(([file, content]) => [
      file,
      content
        .replace(
          /(\n\s*)\d+(?= \(__unused_rspack_module, exports\) \{)/g,
          '$1<MODULE_ID>',
        )
        .replace(
          /(rspackRequire|__webpack_require__)\("?\d+"?\)/g,
          '$1("<MODULE_ID>")',
        ),
    ]),
  );

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
    expect(normalizeVueModuleIds(jsResult.contents.esm1!))
      .toMatchInlineSnapshot(`
        {
          "<ROOT>/tests/integration/vue/dist/bundle/index.js": "import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
        var modules = {};
        var moduleCache = {};
        function rspackRequire(moduleId) {
            var cachedModule = moduleCache[moduleId];
            if (void 0 !== cachedModule) return cachedModule.exports;
            var module = moduleCache[moduleId] = {
                exports: {}
            };
            modules[moduleId](module, module.exports, rspackRequire);
            return module.exports;
        }
        var moduleFactories = modules;
        moduleFactories.add = function(modules) {
            Object.assign(moduleFactories, modules);
        };
        moduleFactories.add({
            <MODULE_ID> (__unused_rspack_module, exports) {
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
        const exportHelper = rspackRequire("<MODULE_ID>");
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
    expect(normalizeVueModuleIds(jsResult.contents.esm0!))
      .toMatchInlineSnapshot(`
        {
          "<ROOT>/tests/integration/vue/dist/bundleless/Button/Button.js": "import { rspackRequire, moduleFactories } from "../rslib-runtime~0.js";
        import { createElementBlock, openBlock, ref, toDisplayString } from "vue";
        import "./style.css";
        import "./Button.css";
        moduleFactories.add({
            <MODULE_ID> (__unused_rspack_module, exports) {
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
        const exportHelper = rspackRequire("<MODULE_ID>");
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
          "<ROOT>/tests/integration/vue/dist/bundleless/rslib-runtime~0.js": "var modules = {};
        var moduleCache = {};
        function rspackRequire(moduleId) {
            var cachedModule = moduleCache[moduleId];
            if (void 0 !== cachedModule) return cachedModule.exports;
            var module = moduleCache[moduleId] = {
                exports: {}
            };
            modules[moduleId](module, module.exports, rspackRequire);
            return module.exports;
        }
        var moduleFactories = modules;
        moduleFactories.add = function(modules) {
            Object.assign(moduleFactories, modules);
        };
        export { rspackRequire, moduleFactories };
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
