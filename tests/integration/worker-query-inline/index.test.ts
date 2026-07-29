import { expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';

test('importing with ?worker&inline should emit a working inline Worker constructor', async () => {
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
  expect(Object.keys(contents.esm!)).toHaveLength(1);

  const workerSource = await fetch(workerUrls[0]!).then((response) =>
    response.text(),
  );
  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `globalThis.self = { postMessage: console.log };\n${workerSource}\nself.onmessage({ data: 21 });`,
    ],
    { encoding: 'utf8' },
  ).trim();
  expect(output).toBe('42');
});
