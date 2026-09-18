import wasm from './add.wasm?inline';
import { add as otherAdd } from './add.wasm?other=1&inline=true#fragment';
import { read } from './nested/read.wasm?inline';

export { useNamedAdd } from './named.js';

const add = wasm.add;

export { add, wasm, otherAdd, read };
export const useAdd = (a, b) => add(a, b);
