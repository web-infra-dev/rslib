import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

test('resolve data url', async () => {
  const fixturePath = join(__dirname, 'data-url');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "console.log('x:', 42);
    export { };
    "
  `);
});

test('resolve false', async () => {
  const fixturePath = join(__dirname, 'false');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "var modules = {};
    var moduleCache = {};
    function rspackRequire(moduleId) {
        var cachedModule = moduleCache[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = moduleCache[moduleId] = {
            exports: {}
        };
        modules[moduleId](module, module.exports, rspackRequire);
        return module.exports;
    }
    var moduleFactories = modules;
    var compatGetDefaultExport = (module)=>{
        var getter = module && module.__esModule ? ()=>module['default'] : ()=>module;
        definePropertyGetters(getter, {
            a: getter
        });
        return getter;
    };
    var definePropertyGetters = (exports, getters, values)=>{
        var define = (defs, kind)=>{
            for(var key in defs)if (hasOwnProperty(defs, key) && !hasOwnProperty(exports, key)) Object.defineProperty(exports, key, {
                enumerable: true,
                [kind]: defs[key]
            });
        };
        define(getters, "get");
        define(values, "value");
    };
    moduleFactories.add = function(modules) {
        Object.assign(moduleFactories, modules);
    };
    var hasOwnProperty = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
    moduleFactories.add({
        237 () {}
    });
    const util_ignored_ = rspackRequire("237");
    var util_ignored__default = /*#__PURE__*/ compatGetDefaultExport(util_ignored_);
    console.log('foo:', util_ignored__default());
    console.log('bar: ', "bar");
    "
  `);
});

test('resolve node protocol', async () => {
  const fixturePath = join(__dirname, 'node-protocol');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
      "import node_path from "node:path";
      const { join: join } = node_path;
      export { join };
      "
    `);
});

test('resolve with condition exports', async () => {
  const fixturePath = join(__dirname, 'with-condition-exports');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });

  const entryFiles = ['entry1.js', 'entry2.js', 'entry3.js', 'entry4.js'];
  const getEntryContents = (output: Record<string, string>) =>
    entryFiles.map(
      (filename) => queryContent(output, filename, { basename: true }).content,
    );
  const nodeResults = getEntryContents(contents.esm0!);
  const browserResults = getEntryContents(contents.esm1!);

  expect(isSuccess).toBeTruthy();

  expect(nodeResults[0]).toContain('lib1 mjs');
  expect(nodeResults[1]).toContain('lib2 module');
  expect(nodeResults[2]).toContain('node');
  expect(nodeResults[3]).toContain('lib1 cjs');

  expect(browserResults[0]).toContain('lib1 mjs');
  expect(browserResults[1]).toContain('lib2 module');
  expect(browserResults[2]).toContain('browser');
  expect(browserResults[3]).toContain('lib1 cjs');
});

test('resolve with js extensions', async () => {
  const fixturePath = join(__dirname, 'with-js-extensions');
  const { entries, isSuccess } = await buildAndGetResults({ fixturePath });

  expect(isSuccess).toBeTruthy();
  expect(entries.esm).toMatchInlineSnapshot(`
    "console.log(1);
    export { };
    "
  `);
});

test('resolve with main fields', async () => {
  const fixturePath = join(__dirname, 'with-main-fields');
  const { contents, isSuccess } = await buildAndGetResults({ fixturePath });
  const results = Object.values(contents);

  expect(isSuccess).toBeTruthy();
  expect(Object.values(results[0]!)[0]).toMatchInlineSnapshot(`
    "console.log(1);
    export { };
    "
  `);
  expect(Object.values(results[1]!)[0]).toContain('main');
  expect(Object.values(results[2]!)[0]).toContain('browser');
});
