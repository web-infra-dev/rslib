import { add } from './add.wasm?inline';

export const useNamedAdd = (a, b) => add(a, b);
