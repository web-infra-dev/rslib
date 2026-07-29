import source addModule from './add.wasm';

export const createAdd = () => new WebAssembly.Instance(addModule).exports.add;
