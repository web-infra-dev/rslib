// Relative import paths need explicit file extensions in ECMAScript imports
// when '--moduleResolution' is 'node16' or 'nodenext'.
import { bar } from './bar.js';
import { foo } from './foo.js';

console.log(foo + bar);
