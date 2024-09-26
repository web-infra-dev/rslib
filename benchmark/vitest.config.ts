import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';
import { shared } from '../vitest.workspace';

export default defineConfig({
  test: {
    ...shared,
    name: 'bench',
  },
  plugins: [codspeedPlugin()],
});
