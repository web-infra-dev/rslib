import { defineConfig } from 'vitest/config';
import { shared } from '../../vitest.workspace';

export default defineConfig({
  test: {
    ...shared,
    name: 'dts-unit',
  },
});