// rslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS fixture
const { addPrefix } = require('./utils');

module.exports = (str) => addPrefix('DEBUG:', str, process.env.NODE_ENV);
