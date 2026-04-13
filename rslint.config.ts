import { defineConfig, ts } from '@rslint/core';

export default defineConfig([
  ts.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
        },
      ],
    },
  },
]);
