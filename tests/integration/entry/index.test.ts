import path, { join } from 'node:path';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('default entry', async () => {
  const fixturePath = join(__dirname, 'default');
  const { files } = await buildAndGetResults({ fixturePath });

  expect(files).toMatchInlineSnapshot(`
    {
      "cjs0": [
        "<ROOT>/tests/integration/entry/default/dist/cjs-bundle/index.cjs",
      ],
      "cjs1": [
        "<ROOT>/tests/integration/entry/default/dist/cjs-bundle-false/foo.cjs",
        "<ROOT>/tests/integration/entry/default/dist/cjs-bundle-false/index.cjs",
      ],
      "esm0": [
        "<ROOT>/tests/integration/entry/default/dist/esm-bundle/index.js",
      ],
      "esm1": [
        "<ROOT>/tests/integration/entry/default/dist/esm-bundle-false/foo.js",
        "<ROOT>/tests/integration/entry/default/dist/esm-bundle-false/index.js",
      ],
    }
  `);
});

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
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/foo.cjs",
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/index.cjs",
        "<ROOT>/tests/integration/entry/multiple/dist/cjs/shared.cjs",
      ],
      "esm": [
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
    const src_text = ()=>\`hello \${foo} \${shared}\`;
    export { src_text as text };
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

test('validate entry and throw errors', async () => {
  const fixturePath = join(__dirname, 'validate');
  let errMsg = '';
  try {
    await buildAndGetResults({
      fixturePath,
      configPath: 'bundleWithGlob.config.ts',
    });
  } catch (e) {
    errMsg = (e as AggregateError).errors.join('\n\n');
  }

  expect(stripAnsi(errMsg)).toMatchInlineSnapshot(`
    "Error: Glob pattern "./src" is not supported when "bundle" is "true", considering "bundle" to "false" to use bundleless mode, or specify a file entry to bundle. See https://rslib.rs/guide/basic/output-structure for more details.

    Error: Glob pattern "!./src/ignored" is not supported when "bundle" is "true", considering "bundle" to "false" to use bundleless mode, or specify a file entry to bundle. See https://rslib.rs/guide/basic/output-structure for more details."
  `);

  try {
    await buildAndGetResults({
      fixturePath,
      configPath: 'nonExistingFile.config.ts',
    });
  } catch (e) {
    errMsg = (e as AggregateError).errors.join('\n\n');
  }

  expect(stripAnsi(errMsg)).toMatchInlineSnapshot(
    `"Error: Can't resolve the entry "./src/main.ts" at the location <ROOT>/tests/integration/entry/validate/src/main.ts. Please ensure that the file exists."`,
  );

  try {
    await buildAndGetResults({
      fixturePath,
      configPath: 'bundlelessWithString.config.ts',
    });
  } catch (e) {
    errMsg = (e as Error).message;
  }

  expect(stripAnsi(errMsg)).toMatchInlineSnapshot(
    `"The source.entry configuration should be an object, but received string: ./src/**. Checkout https://rslib.rs/config/rsbuild/source#sourceentry for more details."`,
  );
});

test('duplicate entry in bundleless mode', async () => {
  const { logs, restore } = proxyConsole();
  const fixturePath = join(__dirname, 'duplicate');
  await buildAndGetResults({ fixturePath });

  const logStrings = logs.map((log) => stripAnsi(log));

  expect(
    logStrings.some((log) =>
      log.includes(
        `Duplicate entry index from ${path.normalize(
          'src/index.ts',
        )} and ${path.normalize('src/index.svg')}, which may lead to the incorrect output, please rename the file.`,
      ),
    ),
  ).toBe(true);

  restore();
});
