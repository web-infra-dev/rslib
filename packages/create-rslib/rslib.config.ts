import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [{ format: 'esm' }],
  // TODO: Remove this after bumping Rslib
  output: {
    target: 'node',
  },
});
