import { helper } from './helper';

// Creating the URL must not run this module, so the marker stays unset until
// something actually loads the emitted file.
Object.assign(globalThis, { rslibNewUrlEntry: helper('loaded') });

export const run = (value: string): string => helper(value);
