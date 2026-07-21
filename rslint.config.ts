import { defineConfig, js, ts } from '@rslint/core';

export default defineConfig([
  {
    ignores: [
      // TypeScript does not support source phase imports syntax
      'tests/integration/wasm/static-source/src/utils.js',
      // Generated output should not be linted
      'tests/integration/**/dist/**',
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: [
          './packages/*/tsconfig.json',
          './packages/core/tests/tsconfig.json',
          './examples/*/tsconfig.json',
          './examples/module-federation/*/tsconfig.json',
          './tests/tsconfig.json',
          './tests/scripts/tsconfig.json',
          './tests/type-tests/*/tsconfig.json',
        ],
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
