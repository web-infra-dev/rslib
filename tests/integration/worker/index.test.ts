import { buildAndGetResults, queryContent } from 'test-helper';
import { expect, test } from 'vitest';

test('new Worker(new URL(...)) should be preserved', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = __dirname;
  const { contents } = await buildAndGetResults({
    fixturePath,
  });

  expect(contents.esm).toMatchInlineSnapshot(`
    {
      "<ROOT>/tests/integration/worker/dist/esm/index.js": "const worker = new Worker(new URL('./worker.js', import.meta.url), {
        name: 'my-worker'
    });
    export { worker };
    ",
      "<ROOT>/tests/integration/worker/dist/esm/worker.js": "console.log('Hello from worker', self.name);
    ",
    }
  `);

  expect(queryContent(contents.cjs, /\/index\.js/).content).toContain(
    "new Worker(new URL('./worker.js', __rslib_import_meta_url__)",
  );
});
