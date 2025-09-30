import { createRequire } from 'node:module';

// Using CommonJS require.
const cjs1 = require.resolve('./other');
const cjs2 = require.resolve(`${process.env.DIR}./other`);
const assignedResolve = require.resolve;
const cjs3 = assignedResolve('./other');

// Using createRequire.
const _require = createRequire(import.meta.url);
const cr1 = _require.resolve('./other');
const cr2 = _require.resolve(`${process.env.DIR}./other`);
const assignedResolve2 = _require.resolve;
const cr3 = assignedResolve2('./other');

export { cjs1, cjs2, cjs3, cr1, cr2, cr3 };
