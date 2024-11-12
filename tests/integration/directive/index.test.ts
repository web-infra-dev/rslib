import path, { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { describe, expect, test } from 'vitest';

describe('shebang', async () => {
  const fixturePath = join(__dirname, 'shebang/bundle');
  const { entries } = await buildAndGetResults({ fixturePath });

  test('shebang at the beginning', async () => {
    console.log('😧1', entries.esm0!);
    expect(entries.esm0!.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  test('shebang at the beginning even if minified', async () => {
    expect(entries.esm1!.startsWith('#!/usr/bin/env node')).toBe(true);
  });
});

describe('react', async () => {
  const fixturePath = join(__dirname, 'react/bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });
  test('React directive at the beginning', async () => {
    const bar = Object.entries(contents.esm0!).find(([key]) => {
      return path.basename(key) === 'bar.js';
    })?.[1];

    console.log('😧2', bar!);
    expect(bar!.startsWith(`'use server';`)).toBe(true);

    const foo = Object.entries(contents.esm0!).find(([key]) => {
      return path.basename(key) === 'foo.js';
    })?.[1];

    expect(foo!.startsWith(`'use client';`)).toBe(true);
  });

  test('React directive at the beginning even if minified', async () => {
    const bar = Object.entries(contents.esm1!).find(([key]) => {
      return path.basename(key) === 'bar.js';
    })?.[1];

    expect(bar!.startsWith(`'use server';`)).toBe(true);

    const foo = Object.entries(contents.esm1!).find(([key]) => {
      return path.basename(key) === 'foo.js';
    })?.[1];

    expect(foo!.startsWith(`'use client';`)).toBe(true);
  });
});
