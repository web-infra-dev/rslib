import { expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';

test('new Worker(new URL(...)) should emit analyzable ESM worker URLs', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = __dirname;
  const { contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const workerUrls: string[] = [];
  const workerOptions: (WorkerOptions | undefined)[] = [];
  const originalWorker = globalThis.Worker;
  globalThis.Worker = class {
    constructor(url: URL | string, options?: WorkerOptions) {
      const workerUrl = String(url);
      workerUrls.push(workerUrl);
      workerOptions.push(options);
    }
  } as typeof Worker;

  try {
    await import(pathToFileURL(entryFiles.esm0!).href);
    const bundlelessEntry = Object.keys(contents.esm1!).find((file) =>
      file.endsWith('/index.js'),
    );
    if (!bundlelessEntry) {
      throw new Error('Cannot find bundleless ESM entry');
    }
    await import(pathToFileURL(bundlelessEntry).href);
  } finally {
    globalThis.Worker = originalWorker;
  }

  expect(workerUrls).toHaveLength(2);
  expect(workerOptions).toEqual([{ type: 'module' }, { type: 'module' }]);
  const outputs = workerUrls.map((workerUrl) =>
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `globalThis.self = { postMessage: console.log }; await import(${JSON.stringify(workerUrl)}); self.onmessage({ data: [20, 22] });`,
      ],
      { encoding: 'utf8' },
    ).trim(),
  );

  expect(outputs).toEqual(['42', '42']);
});
