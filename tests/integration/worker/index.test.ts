import { expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildAndGetResults } from 'test-helper';

test('new Worker(new URL(...)) should emit analyzable ESM worker URLs', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = join(__dirname, 'constructor');
  const { contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  expect(contents).toMatchSnapshot();

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

test('new URL(...) should emit analyzable ESM worker module URLs', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = join(__dirname, 'new-url-entry');
  const { contents, entryFiles, files } = await buildAndGetResults({
    fixturePath,
  });

  expect(contents).toMatchSnapshot();
  expect(
    Object.values(files)
      .flat()
      .some((file) => file.endsWith('/static/assets/renderPageWorker.ts')),
  ).toBe(false);

  const bundleEntry = (await import(pathToFileURL(entryFiles.esm0!).href)) as {
    workerFilename: string;
  };
  const bundlelessEntry = Object.keys(contents.esm1!).find((file) =>
    file.endsWith('/index.js'),
  );
  if (!bundlelessEntry) {
    throw new Error('Cannot find bundleless ESM entry');
  }
  const bundleless = (await import(pathToFileURL(bundlelessEntry).href)) as {
    workerFilename: string;
  };

  const outputs = await Promise.all(
    [bundleEntry.workerFilename, bundleless.workerFilename].map(
      async (workerFilename) => {
        const { default: renderPage } = (await import(workerFilename)) as {
          default: (pathname: string) => Promise<string>;
        };

        return renderPage('/docs');
      },
    ),
  );

  expect(outputs).toEqual([
    '<html><body>/docs</body></html>',
    '<html><body>/docs</body></html>',
  ]);
});

test('importing with ?worker should emit a working Worker constructor', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = join(__dirname, 'query');
  const { contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  expect(contents).toMatchSnapshot();

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

test('importing with ?worker&inline should emit a working inline Worker constructor', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = join(__dirname, 'query-inline');
  const { contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  expect(contents).toMatchSnapshot();

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
