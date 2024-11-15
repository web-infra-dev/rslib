import { createRequire } from 'node:module';
const importMetaUrl = import.meta.url;
const require = createRequire(import.meta.url);
const requiredModule = require('./ok.cjs');

// https://github.com/web-infra-dev/rslib/issues/425
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);

// https://github.com/web-infra-dev/rslib/pull/399
export const module = null;

export { importMetaUrl, requiredModule, __filename };
