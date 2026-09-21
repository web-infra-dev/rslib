import wasm, { add } from './add.wasm?inline';

export const useAdd = (a: number, b: number): number => wasm.add(a, b);

export const useNamedAdd = (a: number, b: number): number => add(a, b);
