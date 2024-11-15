import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('require.resolve', async () => {
  const fixturePath = join(__dirname, 'require-resolve');
  const { entries } = await buildAndGetResults({ fixturePath });

  const statements = [
    "let cjs1 = require.resolve('./other')",
    'cjs2 = require.resolve(`${process.env.DIR}./other`)',
    "cjs3 = (0, require.resolve)('./other')",
    "cr1 = _require.resolve('./other')",
    'cr2 = _require.resolve(`${process.env.DIR}./other`)',
    "cr3 = (0, _require.resolve)('./other')",
  ];

  const esmStatements = [
    'import * as __WEBPACK_EXTERNAL_MODULE_node_module__ from "node:module"',
    '_require = (0, __WEBPACK_EXTERNAL_MODULE_node_module__.createRequire)(import.meta.url)',
  ];

  const cjsStatements = [
    '_require = (0, external_node_module_namespaceObject.createRequire)(',
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
  const { entries } = await buildAndGetResults({ fixturePath });

  const statements = [
    'const cjs1 = require(`${process.env.DIR}./other`)',
    'const cjs2 = require(process.env.DIR)',
    'const cr1 = _require(`${process.env.DIR}./other`)',
    'const cr2 = _require(process.env.DIR)',
  ];

  const esmStatements = [
    'import * as __WEBPACK_EXTERNAL_MODULE_node_module__ from "node:module"',
    '_require = (0, __WEBPACK_EXTERNAL_MODULE_node_module__.createRequire)(import.meta.url)',
  ];

  const cjsStatements = [
    '_require = (0, external_node_module_namespaceObject.createRequire)(',
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
  const { entries } = await buildAndGetResults({ fixturePath });

  const statements = [
    'let i1 = import(`${process.env.DIR}./other`)',
    'i2 = import(process.env.DIR)',
    "i3 = import(Math.random() > 0.5 ? './other1' : './other2')",
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
  const { entries } = await buildAndGetResults({ fixturePath });

  expect(entries.esm).toContain(`console.log('./other.js', require);`);

  const statements = [
    'let lazyFn = (module, requireFn)=>{',
    "lazyFn('./other.js', require)",
  ];

  for (const statement of [...statements]) {
    expect(entries.cjs).toContain(statement);
  }
});

test.todo('require.resolve with `require` shims');
