import { getCwdByExample, rslibBuild } from 'test-helper';
import { bench, describe } from 'vitest';

describe('run rslib in examples', () => {
  bench(
    'examples/express-plugin',
    async () => {
      const cwd = getCwdByExample('express-plugin');
      await rslibBuild(cwd);
    },
    { time: 5 },
  );
  bench(
    'examples/react-component-bundle',
    async () => {
      const cwd = getCwdByExample('react-component-bundle');
      await rslibBuild(cwd);
    },
    { time: 5 },
  );
});
