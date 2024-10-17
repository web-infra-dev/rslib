import type { RslibConfig } from '@rslib/core';
import { getCwdByExample, rslibBuild } from 'test-helper';
import { bench, describe } from 'vitest';

// Remove dts emitting before isolated declaration landed as it's out of our performance scope.
const disableDts = (rslibConfig: RslibConfig) => {
  for (const libConfig of rslibConfig.lib!) {
    libConfig.dts = undefined;
  }
};

const iterations = process.env.CI ? 10 : 50;

describe('benchmark Rslib in examples', () => {
  bench(
    'examples/express-plugin',
    async () => {
      const cwd = getCwdByExample('express-plugin');
      await rslibBuild({ cwd, modifyConfig: disableDts });
    },
    { iterations },
  );
  bench(
    'examples/react-component-bundle',
    async () => {
      const cwd = getCwdByExample('react-component-bundle');
      await rslibBuild({ cwd, modifyConfig: disableDts });
    },
    { iterations },
  );
  bench(
    'examples/react-component-bundle-false',
    async () => {
      const cwd = getCwdByExample('react-component-bundle-false');
      await rslibBuild({ cwd, modifyConfig: disableDts });
    },
    { iterations },
  );
  bench(
    'examples/react-component-umd',
    async () => {
      const cwd = getCwdByExample('react-component-bundle-false');
      await rslibBuild({ cwd, modifyConfig: disableDts });
    },
    { iterations },
  );
});
