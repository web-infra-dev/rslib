import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { readPackageJson } from '../src/utils/helper';

vi.mock('rslog');

it('readPackageJson correctly', async () => {
  expect(readPackageJson('path/to/root')).toBeUndefined();
  console.log('__dirname', __dirname);

  expect(readPackageJson(join(__dirname, 'fixtures/config/esm'))).toEqual({
    type: 'module',
  });
});
