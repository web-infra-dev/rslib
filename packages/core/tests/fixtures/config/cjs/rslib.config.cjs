const { defineConfig } = require('../../../../../core/src/loadConfig');

module.exports = defineConfig((_args) => ({
  lib: [],
  source: {
    entry: {
      index: './foo/index.js',
    },
  },
}));
