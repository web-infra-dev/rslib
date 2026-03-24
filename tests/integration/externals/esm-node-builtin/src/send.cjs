const util = require('node:util');
var Stream = require('stream');

function SendStream() {}

util.inherits(SendStream, Stream);

module.exports = {
  SendStream,
  isInheritedCorrectly:
    Object.getPrototypeOf(SendStream.prototype) === Stream.prototype,
};
