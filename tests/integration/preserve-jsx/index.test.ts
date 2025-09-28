import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

test('JSX syntax should be preserved', async () => {
  const fixturePath = join(__dirname, 'default');
  const { contents } = await buildAndGetResults({ fixturePath });
  const { content: cjsContent } = queryContent(contents.cjs, 'Component1.cjs', {
    basename: true,
  });
  await expect(cjsContent).toMatchSnapshot();

  const { content: esmContent } = queryContent(
    contents.esm0!,
    'Component1.js',
    {
      basename: true,
    },
  );
  const { content: esmTsxContent } = queryContent(
    contents.esm0!,
    'Component2.js',
    {
      basename: true,
    },
  );

  // apart from the TS types, this tsx file is completely identical to a jsx file.
  // expect them to be the same after stripping the types.
  expect(esmContent).toBe(esmTsxContent);
  await expect(esmContent).toMatchSnapshot();

  const { content: esmJsxContent } = queryContent(
    contents.esm1!,
    'Component1.jsx',
    {
      basename: true,
    },
  );
  await expect(esmJsxContent).toMatchSnapshot();
  await expect(esmContent.replace(/\.js"/g, '.jsx"')).toBe(esmJsxContent);
});

test('throw error when preserve JSX with bundle mode', async () => {
  const fixturePath = join(__dirname, 'forbid-bundle');
  const build = buildAndGetResults({ fixturePath });

  await expect(build).rejects.toThrowError(
    'Bundle mode does not support preserving JSX syntax. Set `bundle` to `false` or change the JSX runtime to `automatic` or `classic`.',
  );
});
