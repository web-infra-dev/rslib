import { add } from './add.wasm?inline';

export const useAdd = (a, b) => add(a, b);
