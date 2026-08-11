import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

const require = createRequire(import.meta.url);

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
    export default src;
    "
  `);
  expect(logoJs2).toMatchInlineSnapshot(`
    "import logo_namespaceObject from "../static/svg/logo.svg";
    export default logo_namespaceObject;
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
        334 (module) {
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
    var __webpack_exports__ = __webpack_require__(334);
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
    'import image_namespaceObject from "./static/image/image.c74653c171.png";',
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    'const image_namespaceObject = require("./static/image/image.c74653c171.png");',
  );

  // 1. bundleless default
  // esm
  const { content: imageJs1 } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs1).toMatchInlineSnapshot(`
    "import image_namespaceObject from "../static/image/image.c74653c171.png";
    export default image_namespaceObject;
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
        369 (module) {
            module.exports = require("../static/image/image.c74653c171.png");
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
    var __webpack_exports__ = __webpack_require__(369);
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
    export default image_namespaceObject;
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
        369 (module) {
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
    var __webpack_exports__ = __webpack_require__(369);
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
  expect(indexJs).toMatchInlineSnapshot(`
    "var __webpack_require__ = {};
    (()=>{
        __webpack_require__.p = "/public/path/";
    })();
    const image_namespaceObject = __webpack_require__.p + "static/image/image.png";
    const src = image_namespaceObject;
    export default src;
    "
  `);

  // 3. bundleless
  // esm
  const { content: imageJs } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs).toMatchInlineSnapshot(`
    "import { __webpack_require__ } from "../rslib-runtime~2.js";
    const image_namespaceObject = __webpack_require__.p + "static/image/image.png";
    export default image_namespaceObject;
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

test('use Node.js addons', async () => {
  const fixturePath = join(__dirname, 'node-addons');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle
  const { content: bundleEsm } = queryContent(contents.esm0!, /index\.js/);
  const { content: bundleCjs } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(bundleEsm).toContain('createRequire');
  expect(bundleEsm).toContain('fileURLToPath');
  expect(bundleEsm).toContain('test.darwin.node');
  expect(bundleCjs).not.toContain('createRequire');
  expect(bundleCjs).toMatch(/require\(["']node:path["']\)/);
  expect(bundleCjs).toContain('test.darwin.node');

  // 1. bundleless
  const { content: bundlelessEsmIndex } = queryContent(
    contents.esm1!,
    /index\.js/,
  );
  const { content: bundlelessEsmAddon } = queryContent(
    contents.esm1!,
    /test\.darwin\.js/,
  );
  expect(bundlelessEsmIndex).toMatch(/from ["']\.\/test\.darwin\.js["']/);
  expect(bundlelessEsmAddon).toContain('createRequire');
  expect(bundlelessEsmAddon).toContain('fileURLToPath');
  expect(bundlelessEsmAddon).toContain('test.darwin.node');

  const { content: bundlelessCjsIndex } = queryContent(
    contents.cjs1!,
    /index\.cjs/,
  );
  const { content: bundlelessCjsAddon } = queryContent(
    contents.cjs1!,
    /test\.darwin\.cjs/,
  );
  expect(bundlelessCjsIndex).toMatch(
    /require\(["']\.\/test\.darwin\.cjs["']\)/,
  );
  expect(bundlelessCjsAddon).not.toContain('createRequire');
  expect(bundlelessCjsAddon).toMatch(/require\(["']node:path["']\)/);
  expect(bundlelessCjsAddon).toContain('test.darwin.node');

  const sourceAddon = await readFile(join(fixturePath, 'src/test.darwin.node'));
  const emittedAddons = [
    'dist/esm/bundle/test.darwin.node',
    'dist/cjs/bundle/test.darwin.node',
    'dist/esm/bundleless/test.darwin.node',
    'dist/cjs/bundleless/test.darwin.node',
  ];
  for (const addonPath of emittedAddons) {
    expect(await readFile(join(fixturePath, addonPath))).toEqual(sourceAddon);
  }

  // The native fixture is only compatible with Darwin arm64.
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    const esmEntries = [
      'dist/esm/bundle/index.js',
      'dist/esm/bundleless/index.js',
    ];
    for (const entry of esmEntries) {
      const { addon } = await import(join(fixturePath, entry));
      expect(typeof addon.readLength).toBe('function');
    }

    const cjsEntries = [
      'dist/cjs/bundle/index.cjs',
      'dist/cjs/bundleless/index.cjs',
    ];
    for (const entry of cjsEntries) {
      const { addon } = require(join(fixturePath, entry));
      expect(typeof addon.readLength).toBe('function');
    }
  }
});

// Runtime helper: import the emitted module and assert `new URL(...)` resolves
// against the module's own directory. `key` picks the matrix cell; `query`
// selects the emitted entry file. `subpath` is appended to the module dir to
// form the expected URL (empty for a directory reference). The resolved target
// is also checked to exist on disk, so each cell proves the resource is emitted.
const expectUrlResolves = async (
  contents: Record<string, Record<string, string>>,
  key: string,
  query: RegExp,
  exportName: string,
  subpath: string,
) => {
  const { path } = queryContent(contents[key]!, query);
  const mod = await import(path);
  const resolved = mod[exportName];
  const expected = `${pathToFileURL(dirname(path)).href}/${subpath}`;
  expect(resolved.href).toBe(expected);
  // The resolved URL must point to a real emitted target on disk.
  expect(existsSync(resolved)).toBe(true);
};

test('preserve `new URL` file asset as relative URL', async () => {
  // `new URL('./assets/logo.svg', import.meta.url)` points to an emitted asset
  // and is kept as a static relative URL. At runtime it resolves to the emitted
  // `static/svg/logo.svg` next to the module across every matrix cell.
  // Matrix (lib array order): esm0 = bundle, esm1 = bundleless.
  const { contents, files } = await buildAndGetResults({
    fixturePath: join(__dirname, 'new-url'),
  });

  const asset = 'static/svg/logo.svg';
  // esm × bundle
  await expectUrlResolves(contents, 'esm0', /index\.js/, 'logo', asset);
  // esm × bundleless
  await expectUrlResolves(contents, 'esm1', /index\.js/, 'logo', asset);
  // The asset is emitted as a file, without an extra `assets/logo.*` JS chunk.
  expect(files.esm1!.some((f) => /assets\/logo\.js$/.test(f))).toBe(false);
});

test('preserve `new URL` file asset as relative URL in node_modules', async () => {
  // A package under `node_modules` is handled the same way as the source: the
  // asset is emitted and the URL is kept relative, without any Rspack runtime.
  const { contents } = await buildAndGetResults({
    fixturePath: join(__dirname, 'new-url-node-modules'),
  });

  const { content } = queryContent(contents.esm!, /index\.js/);
  expect(content).not.toContain('__webpack_require__');

  // From the source.
  await expectUrlResolves(
    contents,
    'esm',
    /index\.js/,
    'logo',
    'static/svg/logo.svg',
  );
  // From `node_modules/dep`.
  await expectUrlResolves(
    contents,
    'esm',
    /index\.js/,
    'depLogo',
    'static/svg/dep-logo.svg',
  );
});
