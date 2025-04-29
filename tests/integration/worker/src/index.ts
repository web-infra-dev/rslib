export const worker = new Worker(new URL('./worker.js', import.meta.url), {
  name: 'my-worker',
});
