import path from 'node:path';
import { beforeAll, expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

beforeAll(async () => {
  const fixturePath = path.resolve(__dirname, './style');
  contents = (await buildAndGetResults({ fixturePath })).contents;
});

test('0. default', async () => {
  const { content: cssIndexJs } = queryContent(
    contents.esm0!,
    /esm\/less\/index\.js/,
  );
  const { content: cssIndexCjs } = queryContent(
    contents.cjs0!,
    /cjs\/less\/index\.cjs/,
  );
  expect(cssIndexJs).toMatchInlineSnapshot(`
    "import "./index.css";
    import "./index.css?inline";
    "
  `);
  expect(cssIndexCjs).toContain('require("./index.css");');
  expect(cssIndexCjs).toContain('require("./index.css?inline");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm0!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs0!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toContain(
    'import index_module from "./index.module.js";',
  );
  expect(cssModuleIndexJs).toContain(
    'import index_moduleinline from "./index_module.css?inline";',
  );
  expect(cssModuleIndexCjs).toContain(
    'const external_index_module_cjs_namespaceObject = require("./index.module.cjs");',
  );
  expect(cssModuleIndexCjs).toContain(
    'const external_index_moduleinline_namespaceObject = require("./index_module.css?inline");',
  );
});

test('1. style.path: false', () => {
  const { content: cssIndexJs } = queryContent(
    contents.esm1!,
    /esm\/less\/index\.js/,
  );
  const { content: cssIndexCjs } = queryContent(
    contents.cjs1!,
    /cjs\/less\/index\.cjs/,
  );
  expect(cssIndexJs).toMatchInlineSnapshot(`
    "import "@/less/index.css";
    import "@/less/index.css?inline";
    "
  `);
  expect(cssIndexCjs).toContain('require("@/less/index.css");');
  expect(cssIndexCjs).toContain('require("@/less/index.css?inline");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm1!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs1!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toContain(
    'import index_module from "@/module/index.module.js";',
  );
  expect(cssModuleIndexJs).toContain(
    'import index_moduleinline from "@/module/index_module.css?inline";',
  );
  expect(cssModuleIndexCjs).toContain(
    'const index_module_cjs_namespaceObject = require("@/module/index.module.cjs");',
  );
  expect(cssModuleIndexCjs).toContain(
    'const index_moduleinline_namespaceObject = require("@/module/index_module.css?inline");',
  );
});

test('2. style.extension: false', async () => {
  const { content: cssIndexJs } = queryContent(
    contents.esm2!,
    /esm\/less\/index\.js/,
  );
  const { content: cssIndexCjs } = queryContent(
    contents.cjs2!,
    /cjs\/less\/index\.cjs/,
  );
  expect(cssIndexJs).toMatchInlineSnapshot(`
    "import "./index.less";
    import "./index.less?inline";
    "
  `);
  expect(cssIndexCjs).toContain('require("./index.less");');
  expect(cssIndexCjs).toContain('require("./index.less?inline");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm2!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs2!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toContain(
    'import index_module from "./index.module.less";',
  );
  expect(cssModuleIndexJs).toContain(
    'import index_moduleinline from "./index.module.less?inline";',
  );
  expect(cssModuleIndexCjs).toContain(
    'const external_index_module_less_namespaceObject = require("./index.module.less");',
  );
  expect(cssModuleIndexCjs).toContain(
    'const external_index_moduleinline_namespaceObject = require("./index.module.less?inline");',
  );
});

test('3. style.path: false, style.extension: false', async () => {
  const { content: cssIndexJs } = queryContent(
    contents.esm3!,
    /esm\/less\/index\.js/,
  );
  const { content: cssIndexCjs } = queryContent(
    contents.cjs3!,
    /cjs\/less\/index\.cjs/,
  );
  expect(cssIndexJs).toMatchInlineSnapshot(`
    "import "@/less/index.less";
    import "@/less/index.less?inline";
    "
  `);
  expect(cssIndexCjs).toContain('require("@/less/index.css");');
  expect(cssIndexCjs).toContain('require("@/less/index.css?inline");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm3!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs3!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toContain(
    'import index_module from "@/module/index.module.less";',
  );
  expect(cssModuleIndexJs).toContain(
    'import index_moduleinline from "@/module/index.module.less?inline";',
  );
  expect(cssModuleIndexCjs).toContain(
    'const index_module_cjs_namespaceObject = require("@/module/index.module.cjs");',
  );
  expect(cssModuleIndexCjs).toContain(
    'const index_moduleinline_namespaceObject = require("@/module/index_module.css?inline");',
  );
});

test('should external 3rd packages CSS', async () => {
  const { content: cssIndexJs } = queryContent(
    contents.esm0!,
    /esm\/less\/index\.js/,
  );
  const { content: cssIndexCjs } = queryContent(
    contents.cjs0!,
    /cjs\/less\/index\.cjs/,
  );
  expect(cssIndexJs).toMatchInlineSnapshot(`
    "import "./index.css";
    import "./index.css?inline";
    "
  `);
  expect(cssIndexCjs).toContain('require("./index.css");');
  expect(cssIndexCjs).toContain('require("./index.css?inline");');

  const { content: pkgIndexJs } = queryContent(
    contents.esm0!,
    /esm\/pkg\/index\.js/,
  );
  const { content: pkgIndexCjs } = queryContent(
    contents.cjs0!,
    /cjs\/pkg\/index\.cjs/,
  );
  expect(pkgIndexJs).toMatchInlineSnapshot(`
    "import "element-ui/lib/theme-chunk/index.css";
    import "element-ui/lib/theme-chunk/index";
    import "third-party/index.module.scss";
    "
  `);
  expect(pkgIndexCjs).toContain(
    `require("element-ui/lib/theme-chunk/index.css");
require("element-ui/lib/theme-chunk/index");
require("third-party/index.module.scss");`,
  );
});
