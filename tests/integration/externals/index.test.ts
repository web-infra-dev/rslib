import { join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, proxyConsole, queryContent } from 'test-helper';

import { composeModuleImportWarn } from '../../../packages/core/src/config';

test('should fail to build when `output.target` is not "node"', async () => {
  const fixturePath = join(__dirname, 'browser');
  const { restore } = proxyConsole();
  const build = buildAndGetResults({ fixturePath });
  await expect(build).rejects.toThrowError('Rspack build failed.');
  restore();
});

test('auto externalize Node.js built-in modules when `output.target` is "node"', async () => {
  const fixturePath = join(__dirname, 'node');
  const { restore } = proxyConsole();
  const { entries } = await buildAndGetResults({ fixturePath });
  restore();

  for (const external of [
    'import * as __WEBPACK_EXTERNAL_MODULE_bar__ from "bar"',
    'import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "node:module"',
    'import fs from "fs"',
    'import node_assert from "node:assert"',
    'import react from "react"',
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
  const { restore } = proxyConsole();
  const { entryFiles } = await buildAndGetResults({ fixturePath });
  restore();
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
    "import node_fs from "node:fs";
    import lodash from "lodash";
    import zip from "lodash/zip";
    console.log(node_fs, lodash.add, zip, "foo");
    "
  `,
  );

  expect(
    queryContent(contents.esm1!, 'index.js', { basename: true }).content,
  ).toMatchInlineSnapshot(`
    "import node_fs from "node:fs";
    import lodash from "lodash";
    import zip from "lodash/zip";
    import { foo } from "./foo2";
    console.log(node_fs, lodash.add, zip, foo);
    "
  `);
});

test('warn when bundleless external depends on devDependencies', async () => {
  const fixturePath = join(__dirname, 'dev-dependency-warning');
  const { logs, restore } = proxyConsole();

  await buildAndGetResults({ fixturePath });

  restore();
  const warnLogs = logs.map((log) => stripAnsi(String(log)));
  console.log(warnLogs);
  const jsMatchingLog = warnLogs.filter(
    (log) =>
      log.includes('The externalized request "left-pad/lib" from index.ts is declared in "devDependencies" in package.json. Bundleless mode does not include devDependencies in the output, consider moving it to "dependencies" or "peerDependencies".')
  );
  expect(jsMatchingLog.length).toBe(1);
  const cssMatchingLog = warnLogs.filter(
    (log) =>
      log.includes('The externalized request "normalize.css" from index.ts is declared in "devDependencies" in package.json. Bundleless mode does not include devDependencies in the output, consider moving it to "dependencies" or "peerDependencies".')
  );
  expect(cssMatchingLog.length).toBe(1);
});
