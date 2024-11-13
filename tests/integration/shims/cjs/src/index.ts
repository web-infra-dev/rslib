import { createRequire } from 'node:module';
const importMetaUrl = import.meta.url;
const require = createRequire(import.meta.url);
const requiredModule = require('./ok.cjs');

const module = null;

export { importMetaUrl, requiredModule, module };
