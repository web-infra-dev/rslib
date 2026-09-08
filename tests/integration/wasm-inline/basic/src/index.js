import wasm from './add.wasm?inline';

export { useNamedAdd } from './named.js';

const add = wasm.add;

export { add, wasm };
export const useAdd = (a, b) => add(a, b);
