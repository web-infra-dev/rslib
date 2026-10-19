import source addModule from './add.wasm?inline';

export const useSourceAdd = (a, b) =>
  new WebAssembly.Instance(addModule).exports.add(a, b);

export const useDynamicSourceAdd = async (a, b) => {
  const module = await import.source('./add.wasm?inline');
  return new WebAssembly.Instance(module).exports.add(a, b);
};
