import fs from 'node:fs';
import { join } from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import { defineConfig } from '@rslib/core';
import { generateBundleMFConfig } from 'test-helper';

const distPath = join(__dirname, 'dist/mf');

const afterDevCompileDonePlugin: RsbuildPlugin = {
  name: 'dev-done',
  setup(api) {
    api.onDevCompileDone(() => {
      fs.writeFileSync(join(distPath, 'done.txt'), 'done');
    });
  },
};

export default defineConfig({
  lib: [generateBundleMFConfig({ name: 'test' })],
  server: {
    port: 3011,
    open: true,
  },
  plugins: [afterDevCompileDonePlugin],
});
