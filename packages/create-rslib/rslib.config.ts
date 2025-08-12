import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

const { execSync } = require('node:child_process');

export default defineConfig({
  lib: [{ format: 'esm', syntax: 'es2022' }],
  plugins: [
    pluginPublint(),
    {
      name: 'rslib:run-generate-template-hook',
      setup: (api) => {
        api.onAfterBuild(() => {
          execSync('pnpm run generate-templates', { stdio: 'inherit' });
        });
      },
    },
  ],
});
