import { defineConfig } from '@rstest/core';
import { shared } from '../../rstest.workspace';

export default defineConfig({
  ...shared,
  name: 'unit',
});
