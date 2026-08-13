// we can also use `import`, but then
// every export should be explicitly defined

// rslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS mock
const { fs } = require('memfs');
module.exports = fs;
