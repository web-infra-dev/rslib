const { addPrefix } = require('./utils');

module.exports = (str) => addPrefix('DEBUG:', str, process.env.NODE_ENV);
