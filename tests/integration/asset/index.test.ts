import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('set the size threshold to inline static assets', async () => {
  const fixturePath = join(__dirname, 'limit');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle default
  // esm
  const { content: indexJs0 } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs0).toContain(
    "import logo_namespaceObject from './static/svg/logo.svg';",
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    "const logo_namespaceObject = require('./static/svg/logo.svg');",
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
    "import * as __WEBPACK_EXTERNAL_MODULE__assets_logo_js_450929b7__ from "./assets/logo.js";
    const src_rslib_entry_ = __WEBPACK_EXTERNAL_MODULE__assets_logo_js_450929b7__["default"];
    export { src_rslib_entry_ as default };
    "
  `);
  expect(logoJs2).toMatchInlineSnapshot(`
    "import __rslib_asset__ from '../static/svg/logo.svg';
    export default __rslib_asset__;
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
    "module.exports = require('../static/svg/logo.svg');
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
    "import image_namespaceObject from './static/image/image.c74653c1.png';",
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    "const image_namespaceObject = require('./static/image/image.c74653c1.png');",
  );

  // 1. bundleless default
  // esm
  const { content: imageJs1 } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs1).toMatchInlineSnapshot(`
    "import __rslib_asset__ from '../static/image/image.c74653c1712618b1.png';
    export default __rslib_asset__;
    "
  `);
  // cjs
  const { content: imageCjs1 } = queryContent(
    contents.cjs1!,
    /assets\/image\.cjs/,
  );
  expect(imageCjs1).toMatchInlineSnapshot(`
    "module.exports = require('../static/image/image.c74653c1712618b1.png');
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
    "import image_namespaceObject from './assets/bundle/image.png';",
  );
  // cjs
  const { content: indexCjs0 } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs0).toContain(
    "const image_namespaceObject = require('./assets/bundle/image.png');",
  );

  // 1. bundleless default
  // esm
  const { content: imageJs1 } = queryContent(
    contents.esm1!,
    /assets\/image\.js/,
  );
  expect(imageJs1).toMatchInlineSnapshot(`
    "import __rslib_asset__ from '../assets/bundleless/image.png';
    export default __rslib_asset__;
    "
  `);
  // cjs
  const { content: imageCjs1 } = queryContent(
    contents.cjs1!,
    /assets\/image\.cjs/,
  );
  expect(imageCjs1).toMatchInlineSnapshot(`
    "module.exports = require('../assets/bundleless/image.png');
    "
  `);
});

test('set the assets public path', async () => {
  const fixturePath = join(__dirname, 'public-path');
  const { contents } = await buildAndGetResults({ fixturePath });
  
  // umd should preserve '__webpack_require__.p'
  const { content: indexUmdJs } = queryContent(contents.umd!, /index\.js/);

  expect(indexUmdJs).toContain(
    '__webpack_require__.p = "/public/path/bundleless/";',
  );
  expect(indexUmdJs).toContain(
    'const image_namespaceObject = __webpack_require__.p + "static/image/image.png";',
  );
});

test('use svgr', async () => {
  const fixturePath = join(__dirname, 'svgr');
  const { contents } = await buildAndGetResults({ fixturePath });

  // 0. bundle
  // esm
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  expect(indexJs).matchSnapshot();
  // cjs
  const { content: indexCjs } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexCjs).matchSnapshot();

  // 1. bundleless
  const { content: namedImportJs } = queryContent(
    contents.esm1!,
    /namedImport\.js/,
  );
  expect(namedImportJs).toMatchSnapshot();
  const { content: defaultImportJs } = queryContent(
    contents.esm1!,
    /namedImport\.js/,
  );
  expect(defaultImportJs).toMatchSnapshot();

  const { content: namedImportCjs } = queryContent(
    contents.cjs1!,
    /namedImport\.cjs/,
  );
  expect(namedImportCjs).toMatchSnapshot();
  const { content: defaultImportCjs } = queryContent(
    contents.cjs1!,
    /namedImport\.cjs/,
  );
  expect(defaultImportCjs).toMatchSnapshot();
});
