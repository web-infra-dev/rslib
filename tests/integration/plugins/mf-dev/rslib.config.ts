import fs from 'node:fs';
import path from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import type { RsbuildPlugin } from '@rsbuild/core';
import { defineConfig } from '@rslib/core';

let count = 0;
export const plugin1Path = path.resolve(__dirname, 'dist/plugin1.txt');
export const plugin2Path = path.resolve(__dirname, 'dist/plugin2.txt');

const testPlugin1: RsbuildPlugin = {
  name: 'test1',
  setup(api) {
    api.onDevCompileDone(() => {
      fs.writeFileSync(plugin1Path, `plugin1 count: ${++count}`);
    });
  },
};

const testPlugin2: RsbuildPlugin = {
  name: 'test2',
  setup(api) {
    api.onDevCompileDone(() => {
      fs.writeFileSync(plugin2Path, 'plugin2');
    });
  },
};

export default defineConfig({
  lib: [
    {
      format: 'mf',
      plugins: [pluginModuleFederation({ name: 'test-plugins' }), testPlugin2],
    },
  ],
  plugins: [testPlugin1],
});
