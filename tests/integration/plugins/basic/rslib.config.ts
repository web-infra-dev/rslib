import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import { defineConfig } from '@rslib/core';

let count = 0;
export const distIndex = path.resolve(__dirname, 'dist/count.txt');

const testPlugin: RsbuildPlugin = {
  name: 'test',
  setup(api) {
    api.onAfterBuild(() => {
      fs.writeFileSync(distIndex, `count: ${++count}`);
    });
  },
};

export default defineConfig({
  lib: [{ format: 'esm' }, { format: 'cjs' }],
  plugins: [testPlugin],
});
