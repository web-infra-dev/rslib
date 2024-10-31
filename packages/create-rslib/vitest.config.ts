import { defineConfig } from 'vitest/config';
import { shared } from '../../vitest.workspace';

export default defineConfig({
  test: {
    ...shared,
    name: 'unit-create',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
