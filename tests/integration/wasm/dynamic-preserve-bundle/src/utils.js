export const createAdd = async () => {
  const wasm = await import('./add.wasm');
  return wasm.add;
};
