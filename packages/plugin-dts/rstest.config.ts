import { defineConfig } from '@rstest/core';
import { shared } from '../../rstest.workspace';

// Disable color in test
process.env.NO_COLOR = '1';

export default defineConfig({
  ...shared,
  name: 'unit-dts',
});
