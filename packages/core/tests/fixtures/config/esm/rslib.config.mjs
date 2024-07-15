import { defineConfig } from '../../../../../core/src/config';

export default defineConfig((args) => ({
  lib: [],
  source: {
    entry: {
      main: './foo/index.js',
    },
  },
}));
