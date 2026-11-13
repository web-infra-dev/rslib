import { expect, test } from '@rstest/core';
import { composeCreateRsbuildConfig } from '../src/config';
import type { RslibConfig } from '../src/types';

type Cache = NonNullable<RslibConfig['performance']>['buildCache'];
const version = 'rslib-0.0.0';
const defaults = { cacheDigest: [version] };
const sharedOptions = {
  cacheDigest: ['shared'],
  cacheDirectory: 'shared-cache',
  buildDependencies: ['shared.config'],
};
const localOptions = {
  cacheDigest: ['local'],
  cacheDirectory: 'local-cache',
  buildDependencies: ['local.config'],
};

test.each<[string, Cache, Cache, Cache]>([
  ['default cache', undefined, undefined, defaults],
  ['explicitly enabled', true, undefined, defaults],
  ['disabled globally', false, undefined, false],
  ['re-enabled per lib', false, true, defaults],
  [
    'inherits shared options',
    sharedOptions,
    undefined,
    { ...sharedOptions, cacheDigest: [version, 'shared'] },
  ],
  ['lib true resets shared options', sharedOptions, true, defaults],
  ['lib false disables cache', sharedOptions, false, false],
  [
    'merges shared and lib options',
    sharedOptions,
    localOptions,
    {
      cacheDigest: [version, 'shared', 'local'],
      cacheDirectory: 'local-cache',
      buildDependencies: ['shared.config', 'local.config'],
    },
  ],
])('%s', async (_name, shared, local, expected) => {
  const config: RslibConfig = {
    performance: { buildCache: shared },
    lib: [{ performance: { buildCache: local } }],
  };
  const original = structuredClone(config);
  const [result] = await composeCreateRsbuildConfig(config);

  expect(result!.config.performance?.buildCache).toEqual(expected);
  expect(config).toEqual(original);
});
