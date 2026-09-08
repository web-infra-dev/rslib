import wasm from './add.wasm?inline';

export const useAdd = (a, b) => wasm.add(a, b);
