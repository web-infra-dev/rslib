import fs from 'node:fs';
import { join } from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import type { RsbuildPlugin } from '@rsbuild/core';
import { defineConfig } from '@rslib/core';

const distPath = join(__dirname, 'dist');

const afterDevCompileDonePlugin: RsbuildPlugin = {
  name: 'dev-done',
  setup(api) {
    api.onDevCompileDone(() => {
      fs.writeFileSync(join(distPath, 'done.txt'), 'done');
    });
  },
};

export default defineConfig({
  lib: [
    {
      format: 'mf',
    },
  ],
  server: {
    port: 3011,
    open: true,
  },
  plugins: [
    pluginModuleFederation({
      name: 'test',
    }),
    afterDevCompileDonePlugin,
  ],
});
