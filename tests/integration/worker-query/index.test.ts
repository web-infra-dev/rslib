import { expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';

test('importing with ?worker should emit a working Worker constructor', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = __dirname;
  const { entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  const workerUrls: string[] = [];
  const workerOptions: (WorkerOptions | undefined)[] = [];
  const originalWorker = globalThis.Worker;
  globalThis.Worker = class {
    constructor(url: URL | string, options?: WorkerOptions) {
      workerUrls.push(String(url));
      workerOptions.push(options);
    }
  } as typeof Worker;

  try {
    await import(pathToFileURL(entryFiles.esm!).href);
  } finally {
    globalThis.Worker = originalWorker;
  }

  expect(workerUrls).toHaveLength(1);
  expect(workerOptions).toEqual([{ type: 'module' }]);

  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `globalThis.self = { postMessage: console.log }; await import(${JSON.stringify(workerUrls[0])}); self.onmessage({ data: 21 });`,
    ],
    { encoding: 'utf8' },
  ).trim();
  expect(output).toBe('42');
});
