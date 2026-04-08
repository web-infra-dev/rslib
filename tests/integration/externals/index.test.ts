import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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
    'import * as __rspack_external_bar from "bar";',
    'import { createRequire as __rspack_createRequire } from "node:module";',
    'import node_assert from "node:assert";',
    'import fs from "fs";',
    'import react from "react";',
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

test('should preserve CommonJS node built-in semantics in ESM output', async () => {
  const fixturePath = join(__dirname, 'esm-node-builtin');
  const { entries, entryFiles } = await buildAndGetResults({
    fixturePath,
    lib: ['esm-default'],
  });

  // Built-in modules required from bundled CommonJS should keep using createRequire.
  expect(entries.esm0).toContain(
    'module.exports = __rspack_createRequire_require("node:util");',
  );
  // Another built-in on the CommonJS path should follow the same node-commonjs runtime semantics.
  expect(entries.esm0).toContain(
    'module.exports = __rspack_createRequire_require("stream");',
  );
  // Lazy built-in imports should still be emitted in a runtime-safe form.
  expect(entries.esm0).toContain('import("node:os")');
  expect(entries.esm0).toContain('import("node:path")');

  const esmOutput = await import(pathToFileURL(entryFiles.esm0!).href);

  // The CommonJS helper should still run correctly after the built-in handling changes.
  expect(typeof esmOutput.SendStream).toBe('function');
  expect(esmOutput.sendStreamPrototypeIsInherited).toBe(true);
  // The lazy built-in import should stay callable at runtime.
  expect(typeof esmOutput.loadOsPlatform).toBe('function');
  // The remapped built-in stays lazy, so importing the bundle itself should remain safe.
  expect(typeof esmOutput.loadPathSep).toBe('function');
});

test('should report the node built-in error when user externals disables externalization', async () => {
  const fixturePath = join(__dirname, 'esm-node-builtin');

  const { logs, restore } = proxyConsole();
  const build = buildAndGetResults({
    fixturePath,
    lib: ['esm-external-false'],
  });

  await expect(build).rejects.toThrowError('Rspack build failed.');

  const errorLogs = logs.map((log) => stripAnsi(log)).join('\n');
  expect(errorLogs).toContain(
    'is a built-in Node.js module and cannot be imported in client-side code',
  );

  restore();
});

test('should remap node built-ins with user externals', async () => {
  const fixturePath = join(__dirname, 'esm-node-builtin');
  const { entries, entryFiles } = await buildAndGetResults({
    fixturePath,
    lib: ['esm-external-foo'],
  });

  // `node:path` should follow the user-configured external target instead of the default built-in external handling.
  expect(entries.esm2).toContain('import("foo")');
  expect(entries.esm2).not.toContain('node:path');

  // The remapped built-in stays lazy, so importing the bundle itself should remain safe.
  const esmOutput = await import(pathToFileURL(entryFiles.esm2!).href);
  expect(typeof esmOutput.loadPathSep).toBe('function');
});

test('should get warn when use require in ESM', async () => {
  const { logs, restore } = proxyConsole();
  const fixturePath = join(__dirname, 'module-import-warn');
  const { entries } = await buildAndGetResults({ fixturePath });
  const logStrings = logs.map((log) => stripAnsi(log));
  const issuer = join(fixturePath, 'src/index.ts');

  for (const external of [
    'import * as __rspack_external_bar from "bar";',
    'import * as __rspack_external_foo from "foo";',
    'import * as __rspack_external_qux from "qux";',
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
  const baz = (await import(pathToFileURL(entryFiles.cjs).href)).baz;
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
