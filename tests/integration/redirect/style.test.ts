import path from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { beforeAll, expect, test } from 'vitest';

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
    "
  `);
  expect(cssIndexCjs).toContain('require("./index.css");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm0!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs0!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toMatchInlineSnapshot(`
    "import default_0 from "./index.module.js";
    "
  `);
  expect(cssModuleIndexCjs).toContain(
    'const external_index_module_cjs_namespaceObject = require("./index.module.cjs");',
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
    "
  `);
  expect(cssIndexCjs).toContain('require("@/less/index.css");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm1!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs1!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toMatchInlineSnapshot(`
    "import default_0 from "@/module/index.module.js";
    "
  `);
  expect(cssModuleIndexCjs).toContain(
    'const index_module_cjs_namespaceObject = require("@/module/index.module.cjs");',
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
    "
  `);
  expect(cssIndexCjs).toContain('require("./index.less");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm2!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs2!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toMatchInlineSnapshot(`
    "import default_0 from "./index.module.less";
    "
  `);
  expect(cssModuleIndexCjs).toContain(
    'const external_index_module_less_namespaceObject = require("./index.module.less");',
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
    "
  `);
  expect(cssIndexCjs).toContain('require("@/less/index.css");');

  const { content: cssModuleIndexJs } = queryContent(
    contents.esm3!,
    /esm\/module\/index\.js/,
  );
  const { content: cssModuleIndexCjs } = queryContent(
    contents.cjs3!,
    /cjs\/module\/index\.cjs/,
  );
  expect(cssModuleIndexJs).toMatchInlineSnapshot(`
    "import default_0 from "@/module/index.module.less";
    "
  `);
  expect(cssModuleIndexCjs).toContain(
    'const index_module_cjs_namespaceObject = require("@/module/index.module.cjs");',
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
    "
  `);
  expect(cssIndexCjs).toContain('require("./index.css");');

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
    "
  `);
  expect(pkgIndexCjs).toContain(
    `require("element-ui/lib/theme-chunk/index.css");
require("element-ui/lib/theme-chunk/index");`,
  );
});
