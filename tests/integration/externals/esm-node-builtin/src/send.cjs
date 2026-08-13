// rslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS fixture
const util = require('node:util');
// rslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS fixture
const Stream = require('stream');

function SendStream() {}

util.inherits(SendStream, Stream);

module.exports = {
  SendStream,
  isInheritedCorrectly:
    Object.getPrototypeOf(SendStream.prototype) === Stream.prototype,
};
