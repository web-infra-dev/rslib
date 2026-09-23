import { add } from './add.wasm?inline';

export const useAdd = (a: number, b: number): number => add(a, b);
