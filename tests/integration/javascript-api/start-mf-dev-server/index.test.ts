import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { createRslib } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';

describe('rslib.startMFDevServer', async () => {
  test('return port and urls', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'mf',
            plugins: [
              pluginModuleFederation({
                name: 'test-mf-dev-server',
              }),
            ],
          },
        ],
        logLevel: 'silent',
      },
    });

    const result = await rslib.startMFDevServer();

    await result.server.close();

    expect(result.port).not.toBeUndefined();
    expect(result.urls).not.toBeUndefined();
  });

  test('use with lib option to start specify lib id', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'mf',
            id: 'mf-0',
            plugins: [
              pluginModuleFederation({
                name: 'test-mf-dev-server-0',
              }),
            ],
          },
          {
            format: 'mf',
            id: 'mf-1',
            plugins: [
              pluginModuleFederation({
                name: 'test-mf-dev-server-1',
              }),
            ],
          },
        ],
        logLevel: 'silent',
      },
    });

    const result = await rslib.startMFDevServer({
      lib: ['mf-0'],
    });

    await result.server.close();

    expect(result.port).not.toBeUndefined();
    expect(result.urls).not.toBeUndefined();
  });
});
