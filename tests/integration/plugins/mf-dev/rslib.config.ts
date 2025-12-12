import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import { defineConfig } from '@rslib/core';
import { generateBundleMFConfig } from 'test-helper';

let count = 0;
export const plugin1Path = path.resolve(__dirname, 'dist/mf/plugin1.txt');
export const plugin2Path = path.resolve(__dirname, 'dist/mf/plugin2.txt');

const testPlugin1: RsbuildPlugin = {
  name: 'test1',
  setup(api) {
    api.onAfterDevCompile(() => {
      fs.writeFileSync(plugin1Path, `plugin1 count: ${++count}`);
    });
  },
};

const testPlugin2: RsbuildPlugin = {
  name: 'test2',
  setup(api) {
    api.onAfterDevCompile(() => {
      fs.writeFileSync(plugin2Path, 'plugin2');
    });
  },
};

export default defineConfig({
  lib: [
    generateBundleMFConfig(
      { name: 'test-plugins' },
      {
        plugins: [testPlugin2],
      },
    ),
  ],
  server: {
    port: 3009,
  },
  plugins: [testPlugin1],
});
