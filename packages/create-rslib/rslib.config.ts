import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [{ format: 'esm' }],
  output: {
    target: 'node',
  },
});
