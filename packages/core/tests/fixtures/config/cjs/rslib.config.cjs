const { defineConfig } = require('../../../../../core/src/config');

module.exports = defineConfig((args) => ({
  lib: [],
  source: {
    entry: {
      index: './foo/index.js',
    },
  },
}));
