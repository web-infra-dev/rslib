import { defineConfig, js, ts } from '@rslint/core';

export default defineConfig([
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
