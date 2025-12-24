import { defineConfig } from '../../../../../core/src/loadConfig';

export default defineConfig((_args) => ({
  lib: [],
  source: {
    entry: {
      index: './foo/index.js',
    },
  },
}));
