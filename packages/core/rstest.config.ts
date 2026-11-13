import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';
import { shared } from '../../rstest.config';

export default defineConfig({
  ...shared,
  extends: withRslibConfig({
    cwd: import.meta.dirname,
  }),
  name: 'unit',
  source: {
    // Keep cache versions and configuration snapshots stable across releases.
    define: {
      RSLIB_VERSION: JSON.stringify('0.0.0'),
    },
  },
  setupFiles: ['./setupRstestTests.ts'],
});
