import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('source.alias', async () => {
  const fixturePath = __dirname;
  const { contents } = await buildAndGetResults({ fixturePath });

  const { content: indexBundleEsmContent } = queryContent(
    contents.esm0!,
    /esm\/index\.js/,
  );
  const { content: indexBundleCjsContent } = queryContent(
    contents.cjs0!,
    /cjs\/index\.cjs/,
  );
  const { content: indexBundlelessEsmContent } = queryContent(
    contents.esm1!,
    /esm\/index\.js/,
  );
  const { content: indexBundlelessCjsContent } = queryContent(
    contents.cjs1!,
    /cjs\/index\.cjs/,
  );

  // bundle mode
  expect(indexBundleEsmContent).toContain('hello world');
  expect(indexBundleCjsContent).toContain('hello world');

  // bundleless mode
  expect(indexBundlelessEsmContent).toContain(
    'import * as __WEBPACK_EXTERNAL_MODULE__a_js_256e6de1__ from "./a.js";',
  );
  expect(indexBundlelessCjsContent).toContain(
    'const external_a_cjs_namespaceObject = require("./a.cjs");',
  );

  expect(indexBundleEsmContent).toMatchSnapshot();
  expect(indexBundleCjsContent).toMatchSnapshot();
  expect(indexBundlelessEsmContent).toMatchSnapshot();
  expect(indexBundlelessCjsContent).toMatchSnapshot();
});
