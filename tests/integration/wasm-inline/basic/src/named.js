import { add } from './add.wasm?inline';

export { add };
export const useNamedAdd = (a, b) => add(a, b);
