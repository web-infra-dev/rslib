import { createRequire } from 'node:module';

// Using CommonJS require.
const cjs1 = require(`${process.env.DIR}./other`);
const cjs2 = require(process.env.DIR!);

// Using createRequire.
const _require = createRequire(import.meta.url);
const cr1 = _require(`${process.env.DIR}./other`);
const cr2 = _require(process.env.DIR!);

export { cjs1, cjs2, cr1, cr2 };
