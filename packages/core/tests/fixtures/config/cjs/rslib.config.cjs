const { defineConfig } = require('../../../../../core/src/config');

module.exports = defineConfig((_args) => ({
  lib: [],
  source: {
    entry: {
      index: './foo/index.js',
    },
  },
}));
