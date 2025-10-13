import path from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

test('`module` variable should be preserved as-is by `javascript.commonjs.exports = "false"`', async () => {
  const fixturePath = path.resolve(__dirname);
  const { contents } = await buildAndGetResults({
    fixturePath,
  });

  const esm1 = queryContent(contents.esm, 'm1.mjs', { basename: true });
  const esm2 = queryContent(contents.esm, 'm2.mjs', { basename: true });
  const cjs1 = queryContent(contents.cjs, 'm1.js', { basename: true });
  const cjs2 = queryContent(contents.cjs, 'm2.js', { basename: true });

  expect(
    (
      await Promise.all([
        import(esm1.path),
        import(esm2.path),
        import(cjs1.path),
        import(cjs2.path),
      ])
    ).map((m) => m.value),
  ).toEqual([42, 42, 42, 42]);

  const checksM1 = [
    'if (module.children) module.children = module.children.filter((item)=>item.filename !== path);',
    'module.exports = original',
    'if (module.exports && module.exports.test) return module.exports.test()',
  ];

  const checksEsm2 = [
    'if (node_module.children) node_module.children = node_module.children.filter((item)=>item.filename !== path);',
    'node_module.exports = original',
    'if (node_module.exports && node_module.exports.test) return node_module.exports.test()',
  ];

  const checksCjs2 = [
    'if (external_node_module_default().children) external_node_module_default().children = external_node_module_default().children.filter((item)=>item.filename !== path);',
    'external_node_module_default().exports = original',
    'if (external_node_module_default().exports && external_node_module_default().exports.test) return external_node_module_default().exports.test()',
  ];

  for (const check of checksM1) {
    expect(esm1.content).toContain(check);
    expect(cjs1.content).toContain(check);
  }

  for (const check of checksEsm2) {
    expect(esm2.content).toContain(check);
  }

  for (const check of checksCjs2) {
    expect(cjs2.content).toContain(check);
  }
});
