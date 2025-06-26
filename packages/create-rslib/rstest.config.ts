import { defineConfig } from '@rstest/core';
import { shared } from '../../rstest.workspace';

export default defineConfig({
  ...shared,
  name: 'unit-create',
  include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
});
