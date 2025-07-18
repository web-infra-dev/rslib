import { join } from 'node:path';
import { expect, it, rs } from '@rstest/core';
import { checkMFPlugin, readPackageJson } from '../src/utils/helper';

rs.mock('rslog');

it('readPackageJson correctly', async () => {
  expect(readPackageJson('path/to/root')).toBeUndefined();

  expect(readPackageJson(join(__dirname, 'fixtures/config/esm'))).toEqual({
    type: 'module',
  });
});

it('checkMFPlugin correctly', async () => {
  expect(
    checkMFPlugin({
      format: 'mf',
      plugins: [
        { name: 'rsbuild:module-federation-enhanced', setup: () => {} },
      ],
    }),
  ).toEqual(true);

  expect(
    checkMFPlugin({
      format: 'mf',
      plugins: [
        [
          { name: 'rsbuild:module-federation-enhanced', setup: () => {} },
          { name: 'plugin-foo', setup: () => {} },
        ],
      ],
    }),
  ).toEqual(true);
});
