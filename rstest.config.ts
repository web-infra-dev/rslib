// import type { ProjectConfig } from '@rstest/core';
import {
  defineConfig,
  type RsbuildPlugin,
  type RstestConfig,
} from '@rstest/core';
import packageJson from './packages/core/package.json' with { type: 'json' };

const replaceLoaderUrlPlugin: RsbuildPlugin = {
  name: 'replace-loader-url',
  setup(api) {
    api.transform(
      { test: /EntryChunkPlugin.ts$/ },
      async ({ code }: { code: string }) => {
        return code.replace(
          /.\/entryModuleLoader.js/g,
          './entryModuleLoader.ts',
        );
      },
    );
  },
};

export const shared: RstestConfig = {
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60_000,
  hookTimeout: 50_000,
  restoreMocks: true,
  output: {
    module: true,
  },
  source: {
    define: {
      RSLIB_VERSION: JSON.stringify(packageJson.version),
    },
  },
  plugins: [replaceLoaderUrlPlugin],
};

export default defineConfig({
  projects: ['packages/*', 'tests'],
  pool: {
    // Leave some workers available for DTS tests to spawn sub processes
    maxWorkers: '80%',
  },
});
