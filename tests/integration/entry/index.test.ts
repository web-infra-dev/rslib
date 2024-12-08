import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('single entry bundle', async () => {
  const fixturePath = join(__dirname, 'single');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/tests/integration/entry/single/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/tests/integration/entry/single/dist/esm/index.js",
      ],
    }
  `);
});

test('multiple entry bundle', async () => {
  const fixturePath = join(__dirname, 'multiple');
  const { files, contents } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/bar.cjs",
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/foo.cjs",
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/shared.cjs",
      ],
      "esm": [
        "<ROOT>/tests/integration/entry/multiple/dist/esm/bar.js",
        "<ROOT>/tests/integration/entry/multiple/dist/esm/foo.js",
        "<ROOT>/tests/integration/entry/multiple/dist/esm/index.js",
        "<ROOT>/tests/integration/entry/multiple/dist/esm/shared.js",
      ],
    }
  `);

  const { content: index } = queryContent(contents.esm, 'index.js', {
    basename: true,
  });
  expect(index).toMatchInlineSnapshot(`
    "const shared = 'shared';
    const foo = 'foo' + shared;
    const src_rslib_entry_text = ()=>\`hello \${foo} \${shared}\`;
    export { src_rslib_entry_text as text };
    "
  `);

  const { content: foo } = queryContent(contents.esm, 'foo.js', {
    basename: true,
  });
  expect(foo).toMatchInlineSnapshot(`
    "const shared = 'shared';
    const foo = 'foo' + shared;
    export { foo };
    "
  `);

  const { content: bar } = queryContent(contents.esm, 'bar.js', {
    basename: true,
  });
  expect(bar).toMatchInlineSnapshot(`
    "const bar = 'bar';
    export { bar };
    "
  `);

  const { content: shared } = queryContent(contents.esm, 'shared.js', {
    basename: true,
  });
  expect(shared).toMatchInlineSnapshot(`
    "const shared = 'shared';
    export { shared };
    "
  `);
});

test('glob entry bundleless', async () => {
  const fixturePath = join(__dirname, 'glob');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs": [
        "<ROOT>/tests/integration/entry/glob/dist/cjs/bar.cjs",
        "<ROOT>/tests/integration/entry/glob/dist/cjs/foo.cjs",
        "<ROOT>/tests/integration/entry/glob/dist/cjs/index.cjs",
      ],
      "esm": [
        "<ROOT>/tests/integration/entry/glob/dist/esm/bar.js",
        "<ROOT>/tests/integration/entry/glob/dist/esm/foo.js",
        "<ROOT>/tests/integration/entry/glob/dist/esm/index.js",
      ],
    }
  `);
});
