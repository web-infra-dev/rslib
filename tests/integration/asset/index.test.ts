import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

test('set the size threshold to inline static assets', async () => {
  const fixturePath = join(__dirname, 'limit');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle default
  // esm
  const { content: indexJs0 } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs0).toContain(
    'import logo_namespaceObject from "./static/svg/logo.svg";',
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    'const logo_namespaceObject = require("./static/svg/logo.svg");',
  );

  // 1. bundle inline
  // esm
  const { content: indexJs1 } = queryContent(contents.esm1!, /index\.js/);
  expect(indexJs1).toContain(
    'const logo_namespaceObject = "data:image/svg+xml;base64',
  );
  // cjs
  const { content: indexCjs1 } = queryContent(contents.cjs1!, /index\.cjs/);
  expect(indexCjs1).toContain(
    'const logo_namespaceObject = "data:image/svg+xml;base64',
  );

  // 2. bundleless esm default
  // esm
  const { content: indexJs2 } = queryContent(contents.esm2!, /index\.js/);
  const { content: logoJs2 } = queryContent(contents.esm2!, /assets\/logo\.js/);
  expect(indexJs2).toMatchInlineSnapshot(`
    "import logo from "./assets/logo.js";
    const src = logo;
    export { src as default };
    "
  `);
  expect(logoJs2).toMatchInlineSnapshot(`
    "import logo_namespaceObject from "../static/svg/logo.svg";
    export { logo_namespaceObject as default };
    "
  `);
  // cjs
  const { content: indexCjs2 } = queryContent(contents.cjs2!, /index\.cjs/);
  const { content: logoCjs2 } = queryContent(
    contents.cjs2!,
    /assets\/logo\.cjs/,
  );
  expect(indexCjs2).toContain(
    'const logo_cjs_namespaceObject = require("./assets/logo.cjs");',
  );
  expect(logoCjs2).toMatchInlineSnapshot(`
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

test('set the assets filename with hash', async () => {
  const fixturePath = join(__dirname, 'hash');
  const { contents } = await buildAndGetResults({ fixturePath });
  // 0. bundle default
  // esm
  const { content: indexJs0 } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs0).toContain(
    'import image_namespaceObject from "./static/image/image.c74653c1.png";',
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    'const image_namespaceObject = require("./static/image/image.c74653c1.png");',
  );

  // 1. bundleless default
  // esm
  const { content: imageJs1 } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs1).toMatchInlineSnapshot(`
    "import image_namespaceObject from "../static/image/image.c74653c1.png";
    export { image_namespaceObject as default };
    "
  `);
  // cjs
  const { content: imageCjs1 } = queryContent(
    contents.cjs1!,
    /assets\/image\.cjs/,
  );
  expect(imageCjs1).toMatchInlineSnapshot(`
    ""use strict";
    var __webpack_modules__ = {
        "./src/assets/image.png" (module) {
            module.exports = require("../static/image/image.c74653c1.png");
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
});

test('set the assets output path', async () => {
  const fixturePath = join(__dirname, 'path');
  const { contents } = await buildAndGetResults({ fixturePath });
  // 0. bundle default
  // esm
  const { content: indexJs0 } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs0).toContain(
    'import image_namespaceObject from "./assets/bundle/image.png";',
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    'const image_namespaceObject = require("./assets/bundle/image.png");',
  );

  // 1. bundleless default
  // esm
  const { content: imageJs1 } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs1).toMatchInlineSnapshot(`
    "import image_namespaceObject from "../assets/bundleless/image.png";
    export { image_namespaceObject as default };
    "
  `);
  // cjs
  const { content: imageCjs1 } = queryContent(
    contents.cjs1!,
    /assets\/image\.cjs/,
  );
  expect(imageCjs1).toMatchInlineSnapshot(`
    ""use strict";
    var __webpack_modules__ = {
        "./src/assets/image.png" (module) {
            module.exports = require("../assets/bundleless/image.png");
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
});

test('set the assets public path', async () => {
  const fixturePath = join(__dirname, 'public-path');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 1. umd should preserve '__webpack_require__.p'
  const { content: indexUmdJs } = queryContent(contents.umd!, /index\.js/);

  expect(indexUmdJs).toContain('__webpack_require__.p = "/public/path/";');
  expect(indexUmdJs).toContain(
    'const image_namespaceObject = __webpack_require__.p + "static/image/image.png";',
  );

  // 2. bundle
  // esm
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  if (process.env.ADVANCED_ESM) {
    const { content: runtimeJs } = queryContent(contents.esm0!, /runtime\.js/);
    expect(indexJs).toMatchInlineSnapshot(`
      "import { __webpack_require__ } from "./rslib-runtime.js";
      const image_namespaceObject = __webpack_require__.p + "static/image/image.png";
      const src = image_namespaceObject;
      export default src;
      "
    `);
    expect(runtimeJs).toMatchInlineSnapshot(`
      "var __webpack_module_cache__ = {};
      function __webpack_require__(moduleId) {
          var cachedModule = __webpack_module_cache__[moduleId];
          if (void 0 !== cachedModule) return cachedModule.exports;
          var module = __webpack_module_cache__[moduleId] = {
              exports: {}
          };
          __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
          return module.exports;
      }
      (()=>{
          __webpack_require__.add = function(modules) {
              Object.assign(__webpack_require__.m, modules);
          };
      })();
      (()=>{
          __webpack_require__.p = "/public/path/";
      })();
      export { __webpack_require__ };
      "
    `);
  } else {
    expect(indexJs).toMatchInlineSnapshot(`
      "var __webpack_module_cache__ = {};
      function __webpack_require__(moduleId) {
          var cachedModule = __webpack_module_cache__[moduleId];
          if (void 0 !== cachedModule) return cachedModule.exports;
          var module = __webpack_module_cache__[moduleId] = {
              exports: {}
          };
          __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
          return module.exports;
      }
      (()=>{
          __webpack_require__.p = "/public/path/";
      })();
      const image_namespaceObject = __webpack_require__.p + "static/image/image.png";
      const src = image_namespaceObject;
      export { src as default };
      "
    `);
  }

  // 3. bundleless
  // esm
  const { content: imageJs } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs).toMatchInlineSnapshot(`
    "var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        return module.exports;
    }
    (()=>{
        __webpack_require__.p = "/public/path/";
    })();
    const image_namespaceObject = __webpack_require__.p + "static/image/image.png";
    export { image_namespaceObject as default };
    "
  `);
});

test('use json / yaml / toml', async () => {
  const fixturePath = join(__dirname, 'json');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle
  // esm
  const { path: bundleIndexJs } = queryContent(contents.esm0!, /index\.js/);
  expect(await import(bundleIndexJs)).toMatchInlineSnapshot(`
    {
      "Object": {
        "jsonDefault": {
          "items": [
            1,
            2,
          ],
          "name": "default",
        },
        "jsonNamed": {
          "items": [
            3,
            4,
          ],
          "name": "named",
        },
        "tomlDefault": {
          "foo": {
            "bar": "baz",
          },
          "hello": "world",
        },
        "yamlDefault": {
          "foo": {
            "bar": "baz",
          },
          "hello": "world",
        },
      },
    }
  `);
  // 1. bundleless
  // esm
  const { path: bundlelessIndexJs } = queryContent(contents.esm1!, /index\.js/);
  expect(await import(bundlelessIndexJs)).toMatchInlineSnapshot(`
    {
      "Object": {
        "jsonNamed": {
          "items": [
            3,
            4,
          ],
          "name": "named",
        },
        "tomlDefault": {
          "foo": {
            "bar": "baz",
          },
          "hello": "world",
        },
        "yamlDefault": {
          "foo": {
            "bar": "baz",
          },
          "hello": "world",
        },
      },
    }
  `);
  const { path: jsonFile } = queryContent(
    contents.esm1!,
    /json-named-example\.js/,
  );
  expect(await import(jsonFile)).toMatchInlineSnapshot(`
    {
      "default": {
        "items": [
          3,
          4,
        ],
        "name": "named",
      },
      "items": [
        3,
        4,
      ],
      "name": "named",
    }
  `);
  const { path: yamlFile } = queryContent(contents.esm1!, /yaml-example\.js/);
  expect(await import(yamlFile)).toMatchInlineSnapshot(`
    {
      "default": {
        "foo": {
          "bar": "baz",
        },
        "hello": "world",
      },
    }
  `);
  const { path: tomlFile } = queryContent(contents.esm1!, /toml-example\.js/);
  expect(await import(tomlFile)).toMatchInlineSnapshot(`
    {
      "default": {
        "foo": {
          "bar": "baz",
        },
        "hello": "world",
      },
    }
  `);
});

test('use svgr', async () => {
  const fixturePath = join(__dirname, 'svgr');
  const { js, css } = await buildAndGetResults({ fixturePath, type: 'all' });
  const contents = js.contents;
  const cssContents = css.contents;
  // 0. bundle
  // esm
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs).matchSnapshot();
  // cjs
  const { content: indexCjs } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs).matchSnapshot();

  // 1. bundleless mixedImport
  // esm
  const { content: logoJs } = queryContent(contents.esm1!, /assets\/logo\.js/);
  expect(logoJs).toMatchSnapshot(
    'mixedImport: true should contain export { url as default, ReactComponent }',
  );
  // cjs
  const { content: logoCjs } = queryContent(
    contents.cjs1!,
    /assets\/logo\.cjs/,
  );
  expect(logoCjs).toMatchSnapshot(
    'mixedImport: true should contain export { url as default, ReactComponent }',
  );

  // 2. bundleless only svgr
  // esm
  const { content: svgrLogoJs } = queryContent(
    contents.esm2!,
    /assets\/logo\.js/,
  );
  expect(svgrLogoJs).toMatchSnapshot('should only contain svgr default export');
  const { content: urlLogoJs } = queryContent(
    contents.esm2!,
    /assets\/logo2\.js/,
  );
  expect(urlLogoJs).toMatchSnapshot('should only contain url default export');

  // cjs
  const { content: svgrLogoCjs } = queryContent(
    contents.cjs2!,
    /assets\/logo\.cjs/,
  );
  expect(svgrLogoCjs).toMatchSnapshot(
    'should only contain svgr default export',
  );
  const { content: urlLogoCjs } = queryContent(
    contents.cjs2!,
    /assets\/logo2\.cjs/,
  );
  expect(urlLogoCjs).toMatchSnapshot('should only contain url default export');

  // 3. bundleless svg in css
  // esm
  const { content: cssEsm } = queryContent(cssContents.esm3!, /css-entry.css/);
  expect(cssEsm).toMatchInlineSnapshot(`
    ".logo {
      background-image: url(./static/svg/logo.svg);
    }

    "
  `);

  // cjs
  const { content: cssCjs } = queryContent(cssContents.cjs3!, /css-entry.css/);
  expect(cssCjs).toMatchInlineSnapshot(`
    ".logo {
      background-image: url(./static/svg/logo.svg);
    }

    "
  `);
});

test('use asset/source', async () => {
  const fixturePath = join(__dirname, 'source');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle
  // esm
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs).matchSnapshot();
  // 1. bundleless
  // esm
  const { content: dataJs } = queryContent(contents.esm1!, /assets\/draft\.js/);
  expect(dataJs).matchSnapshot();
});

test('use source.assetInclude', async () => {
  const fixturePath = join(__dirname, 'assets-include');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle
  // esm
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs).matchSnapshot();
  // 1. bundleless
  // esm
  const { content: dataJs } = queryContent(contents.esm1!, /assets\/draft\.js/);
  expect(dataJs).matchSnapshot();
});
