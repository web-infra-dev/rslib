import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole } from 'test-helper';

import { composeModuleImportWarn } from '../../../packages/core/src/config';

test('auto external default should works', async () => {
  const fixturePath = join(__dirname, 'default');
  const { js, dts } = await buildAndGetResults({ fixturePath, type: 'all' });

  expect(js.entries.esm).toContain('import react from "react";');

  expect(js!.entries.cjs).toContain(
    'const external_react_namespaceObject = require("react");',
  );

  // dts should externalized
  expect(dts.entries.esm).toContain("import type { oraPromise } from 'ora';");
  expect(dts.entries.cjs).toContain("import type { oraPromise } from 'ora';");
});

test('auto external sub path should works', async () => {
  const fixturePath = join(__dirname, 'external-sub-path');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toContain('import react from "react"');
  expect(entries.esm).toContain('import jsx_runtime from "react/jsx-runtime"');

  expect(entries.cjs).toContain(
    'const external_react_namespaceObject = require("react");',
  );
  expect(entries.cjs).toContain(
    'const jsx_runtime_namespaceObject = require("react/jsx-runtime");',
  );
});

test('auto external should be disabled when bundle is false', async () => {
  const fixturePath = join(__dirname, 'bundle-false');
  const { js } = await buildAndGetResults({ fixturePath, type: 'all' });

  expect(Object.values(js.contents.esm)[0]).toContain(
    'import react from "react"',
  );

  expect(Object.values(js.contents.cjs)[0]).toContain(
    'const external_react_namespaceObject = require("react");',
  );
});

test('auto external false should works', async () => {
  const fixturePath = join(__dirname, 'false');
  const { js, dts } = await buildAndGetResults({ fixturePath, type: 'all' });

  expect(js.entries.esm).not.toContain('import react from "react"');

  expect(js.entries.cjs).not.toContain(
    'const external_react_namespaceObject = require("react");',
  );

  // dts should bundled
  expect(dts.entries.esm).toContain('export declare function oraPromise');
  expect(dts.entries.cjs).toContain('export declare function oraPromise');
});

test('externals should overrides auto external', async () => {
  const fixturePath = join(__dirname, 'with-externals');
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toContain(`import react1 from "react1"`);

  expect(entries.cjs).toContain(
    'const external_react1_namespaceObject = require("react1");',
  );
});

test('should get warn when use require in ESM', async () => {
  const { logs, restore } = proxyConsole();
  const fixturePath = join(__dirname, 'module-import-warn');
  const { entries } = await buildAndGetResults({ fixturePath });
  const logStrings = logs.map((log) => stripAnsi(log));

  const shouldWarn = ['react', 'e2', 'e3', 'e5', 'e6', 'e7'];
  const shouldNotWarn = ['e1', 'e4', 'e8', 'lodash/add', 'lodash/drop'];
  const issuer = join(fixturePath, 'src/index.ts');

  for (const item of shouldWarn) {
    expect(entries.esm).toContain(
      `import * as __WEBPACK_EXTERNAL_MODULE_${item}__ from "${item}"`,
    );
  }

  for (const request of shouldWarn) {
    expect(
      logStrings.some((l) =>
        l.includes(stripAnsi(composeModuleImportWarn(request, issuer))),
      ),
    ).toBe(true);
  }

  for (const request of shouldNotWarn) {
    expect(
      logStrings.some((l) =>
        l.includes(stripAnsi(composeModuleImportWarn(request, issuer))),
      ),
    ).toBe(false);
  }

  restore();
});
