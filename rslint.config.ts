import { defineConfig, globals, js, rstestPlugin, ts } from '@rslint/core';

export default defineConfig([
  {
    ignores: [
      // TypeScript does not support source phase imports syntax
      'tests/integration/wasm/static-source/src/utils.js',
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
      'preserve-caught-error': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    ...rstestPlugin.configs.recommended,
    rules: {
      ...rstestPlugin.configs.recommended.rules,
      'rstest/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expect',
            'assert',
            'expect*',
            'createAndValidate',
          ],
        },
      ],
    },
  },
]);
