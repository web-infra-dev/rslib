export {};

declare module './add.wasm?inline' {
  export const add: (a: number, b: number) => number;
}
