import { bar } from './bar';
import { baz } from './baz.js';
// @ts-ignore
import { foo } from './foo.js';
// @ts-ignore
import { qux } from './qux.cjs';

export const text = foo + bar + baz + qux;
