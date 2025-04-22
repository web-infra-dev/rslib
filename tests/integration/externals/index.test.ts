import { join } from 'node:path';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole, queryContent } from 'test-helper';
import { expect, test } from 'vitest';
import { composeModuleImportWarn } from '../../../packages/core/src/config';

test('should fail to build when `output.target` is not "node"', async () => {
  const fixturePath = join(__dirname, 'browser');
  const build = buildAndGetResults({ fixturePath });
  await expect(build).rejects.toThrowError('Rspack build failed.');
});

test('auto externalize Node.js built-in modules when `output.target` is "node"', async () => {
  const fixturePath = join(__dirname, 'node');
  const { entries } = await buildAndGetResults({ fixturePath });

  for (const external of [
    'import default_0 from "fs"',
    'import default_1 from "node:assert"',
    'import default_2 from "react"',
    'import * as __WEBPACK_EXTERNAL_MODULE_bar__ from "bar"',
    'module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("foo");',
  ]) {
    expect(entries.esm).toContain(external);
  }

  for (const external of [
    'const external_fs_namespaceObject = require("fs");',
    'const external_node_assert_namespaceObject = require("node:assert");',
    'const external_react_namespaceObject = require("react");',
    'module.exports = require("bar");',
    'module.exports = require("foo");',
  ]) {
    expect(entries.cjs).toContain(external);
  }
});

test('should get warn when use require in ESM', async () => {
  const { logs, restore } = proxyConsole();
  const fixturePath = join(__dirname, 'module-import-warn');
  const { entries } = await buildAndGetResults({ fixturePath });
  const logStrings = logs.map((log) => stripAnsi(log));
  const issuer = join(fixturePath, 'src/index.ts');

  for (const external of [
    'import * as __WEBPACK_EXTERNAL_MODULE_bar__ from "bar";',
    'import * as __WEBPACK_EXTERNAL_MODULE_foo__ from "foo";',
  ]) {
    expect(entries.esm).toContain(external);
  }

  for (const external of ['foo', 'bar', 'qux']) {
    expect(
      logStrings.some((l) =>
        l.includes(stripAnsi(composeModuleImportWarn(external, issuer))),
      ),
    ).toBe(true);
  }

  for (const external of ['./baz', 'quxx']) {
    expect(
      logStrings.some((l) =>
        l.includes(stripAnsi(composeModuleImportWarn(external, issuer))),
      ),
    ).toBe(false);
  }

  restore();
});

test('require ESM from CJS', async () => {
  const fixturePath = join(__dirname, 'node');
  const { entryFiles } = await buildAndGetResults({ fixturePath });
  const baz = (await import(entryFiles.cjs)).baz;
  const bazValue = await baz();
  expect(bazValue).toBe('baz');
});

test('user externals', async () => {
  // Ensure the priority of user externals higher than others.
  // - "memfs": userExternalsConfig > targetExternalsConfig
  // - "lodash-es/zip": userExternalsConfig > autoExternalConfig
  // - "./foo2": userExternalsConfig > bundlelessExternalConfig

  const fixturePath = join(__dirname, 'user-externals');
  const { entries, contents } = await buildAndGetResults({ fixturePath });
  expect(entries.esm0).toMatchInlineSnapshot(
    `
    "import default_0 from "node:fs";
    import default_1 from "lodash";
    import default_2 from "lodash/zip";
    const foo = 'foo';
    console.log(default_0, default_1.add, default_2, foo);
    "
  `,
  );

  expect(
    queryContent(contents.esm1!, 'index.js', { basename: true }).content,
  ).toMatchInlineSnapshot(`
    "import default_0 from "node:fs";
    import default_1 from "lodash";
    import default_2 from "lodash/zip";
    import { foo } from "./foo2";
    console.log(default_0, default_1.add, default_2, foo);
    "
  `);
});
