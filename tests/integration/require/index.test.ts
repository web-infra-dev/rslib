import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('require.resolve', async () => {
  const fixturePath = join(__dirname, 'require-resolve');
  const { entries } = await buildAndGetResults(fixturePath);

  const statements = [
    "const cjs1 = require.resolve('./other')",
    'const cjs2 = require.resolve(`${process.env.DIR}./other`)',
    'const assignedResolve = require.resolve',
    "const cjs3 = assignedResolve('./other')",
    "const cr1 = _require.resolve('./other')",
    'const cr2 = _require.resolve(`${process.env.DIR}./other`)',
    'const assignedResolve2 = _require.resolve',
    "const cr3 = assignedResolve2('./other')",
  ];

  const esmStatements = [
    'import * as __WEBPACK_EXTERNAL_MODULE_node_module__ from "node:module"',
    'const _require = (0, __WEBPACK_EXTERNAL_MODULE_node_module__.createRequire)(import.meta.url)',
  ];

  const cjsStatements = [
    'const _require = (0, external_node_module_namespaceObject.createRequire)(__rslib_import_meta_url__)',
  ];

  for (const statement of [...statements, ...esmStatements]) {
    expect(entries.esm).toContain(statement);
  }

  for (const statement of [...statements, ...cjsStatements]) {
    expect(entries.cjs).toContain(statement);
  }
});

test('require dynamic', async () => {
  const fixturePath = join(__dirname, 'require-dynamic');
  const { entries } = await buildAndGetResults(fixturePath);

  const statements = [
    'const cjs1 = require(`${process.env.DIR}./other`)',
    'const cjs2 = require(process.env.DIR)',
    'const cr1 = _require(`${process.env.DIR}./other`)',
    'const cr2 = _require(process.env.DIR)',
  ];

  const esmStatements = [
    'import * as __WEBPACK_EXTERNAL_MODULE_node_module__ from "node:module"',
    'const _require = (0, __WEBPACK_EXTERNAL_MODULE_node_module__.createRequire)(import.meta.url)',
  ];

  const cjsStatements = [
    'const _require = (0, external_node_module_namespaceObject.createRequire)(__rslib_import_meta_url__)',
  ];

  for (const statement of [...statements, ...esmStatements]) {
    expect(entries.esm).toContain(statement);
  }

  for (const statement of [...statements, ...cjsStatements]) {
    expect(entries.cjs).toContain(statement);
  }
});

test('import dynamic', async () => {
  const fixturePath = join(__dirname, 'import-dynamic');
  const { entries } = await buildAndGetResults(fixturePath);

  const statements = [
    'const i1 = import(`${process.env.DIR}./other`)',
    'const i2 = import(process.env.DIR)',
    "const i3 = import(condition ? './other1' : './other2')",
  ];

  for (const statement of [...statements]) {
    expect(entries.esm).toContain(statement);
  }

  for (const statement of [...statements]) {
    expect(entries.cjs).toContain(statement);
  }
});

test('require as expression', async () => {
  const fixturePath = join(__dirname, 'require-as-expression');
  const { entries } = await buildAndGetResults(fixturePath);

  const statements = [
    'const lazyFn = (module, requireFn)=>{}',
    "lazyFn('./other.js', require)",
  ];

  for (const statement of [...statements]) {
    expect(entries.esm).toContain(statement);
  }

  for (const statement of [...statements]) {
    expect(entries.cjs).toContain(statement);
  }
});

test.todo('require.resolve with `require` shims');
