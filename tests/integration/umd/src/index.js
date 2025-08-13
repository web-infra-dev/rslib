import { addPrefix } from './utils.js';

export default (str) => addPrefix('DEBUG:', str, process.env.NODE_ENV);
