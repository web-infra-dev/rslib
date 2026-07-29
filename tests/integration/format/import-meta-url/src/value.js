import url from 'node:url';
export const packageDirectory = url.fileURLToPath(
  new URL(/* rspackIgnore: true */ '.', import.meta.url),
);
export const foo = 'foo';
