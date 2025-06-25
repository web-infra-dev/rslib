/**
 * The following code is modified based on
 * https://github.com/web-infra-dev/rsbuild/blob/c21e2130a285177b890fca543f70377b66d1ad73/e2e/scripts/shared.ts
 */
import net from 'node:net';
import type { Page } from '@playwright/test';
import type {
  CreateRsbuildOptions,
  RsbuildConfig,
  RsbuildPlugins,
} from '@rsbuild/core';

const getHrefByEntryName = (entryName: string, port: number) => {
  const htmlRoot = new URL(`http://localhost:${port}`);
  const homeUrl = new URL(`${entryName}.html`, htmlRoot);

  return homeUrl.href;
};

const gotoPage = async (
  page: Page,
  rsbuild: { port: number },
  path = 'index',
) => {
  const url = getHrefByEntryName(path, rsbuild.port);
  return page.goto(url);
};

function isPortAvailable(port: number) {
  try {
    const server = net.createServer().listen(port);
    return new Promise((resolve) => {
      server.on('listening', () => {
        server.close();
        resolve(true);
      });

      server.on('error', () => {
        resolve(false);
      });
    });
  } catch (_err) {
    return false;
  }
}

const portMap = new Map();
// Available port ranges: 1024 ～ 65535
// `10080` is not available in macOS CI, `> 50000` get 'permission denied' in Windows.
// so we use `15000` ~ `45000`.
async function getRandomPort(
  defaultPort = Math.ceil(Math.random() * 30000) + 15000,
) {
  let port = defaultPort;
  while (true) {
    if (!portMap.get(port) && (await isPortAvailable(port))) {
      portMap.set(port, 1);
      return port;
    }
    port++;
  }
}

const updateConfigForTest = async (
  originalConfig: RsbuildConfig,
  cwd: string = process.cwd(),
) => {
  const { loadConfig, mergeRsbuildConfig } = await import('@rsbuild/core');
  const { content: loadedConfig } = await loadConfig({
    cwd,
  });

  const baseConfig: RsbuildConfig = {
    server: {
      // make port random to avoid conflict
      port: await getRandomPort(),
      printUrls: false,
    },
    performance: {
      buildCache: false,
      printFileSize: false,
    },
  };

  return mergeRsbuildConfig(baseConfig, loadedConfig, originalConfig);
};

const createRsbuild = async (
  rsbuildOptions: CreateRsbuildOptions & {
    rsbuildConfig?: RsbuildConfig;
  },
  plugins: RsbuildPlugins = [],
) => {
  const { createRsbuild: createRsbuildInner } = await import('@rsbuild/core');

  rsbuildOptions.rsbuildConfig ||= {};
  rsbuildOptions.rsbuildConfig.plugins = [
    ...(rsbuildOptions.rsbuildConfig.plugins || []),
    ...(plugins || []),
  ];

  const rsbuild = await createRsbuildInner(rsbuildOptions);
  return rsbuild;
};

export async function dev({
  plugins,
  page,
  ...options
}: CreateRsbuildOptions & {
  plugins?: RsbuildPlugins;
  rsbuildConfig?: RsbuildConfig;
  /**
   * Playwright Page instance.
   * This method will automatically goto the page.
   */
  page?: Page;
}) {
  process.env.NODE_ENV = 'development';

  options.callerName = 'rslib';
  options.rsbuildConfig = await updateConfigForTest(
    options.rsbuildConfig || {},
    options.cwd,
  );

  const rsbuild = await createRsbuild(options, plugins);
  const result = await rsbuild.startDevServer();

  if (page) {
    await gotoPage(page, result);
  }

  return {
    ...result,
    instance: rsbuild,
    close: async () => result.server.close(),
  };
}
