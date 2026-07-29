export const createAdd = async () => {
  const addModule = await import.source('./add.wasm');
  return new WebAssembly.Instance(addModule).exports.add;
};
