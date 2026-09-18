declare module '*add.wasm?inline' {
  const wasmExports: {
    add: (a: number, b: number) => number;
  };
  export default wasmExports;
  export const add: (a: number, b: number) => number;
}
