import url from 'node:url';
export const packageDirectory = url.fileURLToPath(
  new URL('.', import.meta.url),
);
export const foo = 'foo';
