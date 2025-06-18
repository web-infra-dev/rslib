import { defineConfig } from '../../../../../core/src/config';

export default defineConfig((_args) => ({
  lib: [],
  source: {
    entry: {
      index: './foo/index.js',
    },
  },
}));
