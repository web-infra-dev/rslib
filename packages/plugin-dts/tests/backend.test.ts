import { describe, expect, test } from '@rstest/core';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  readTypescriptVersion,
  resolveDtsGenerationBackend,
} from '../src/backend';

describe('resolveDtsGenerationBackend', () => {
  test('should use the old compiler api backend for TypeScript 5 and 6', () => {
    expect(resolveDtsGenerationBackend({}, '5.9.3')).toBe('api-old');
    expect(resolveDtsGenerationBackend({}, '6.0.1')).toBe('api-old');
  });

  test('should use the TypeScript tsc bin backend for TypeScript 7.0', () => {
    expect(resolveDtsGenerationBackend({}, '7.0.1-rc')).toBe('tsc-bin');
    expect(resolveDtsGenerationBackend({ tsgo: true }, '7.0.1-rc')).toBe(
      'tsc-bin',
    );
  });

  test('should use the native-preview tsgo bin backend when tsgo is enabled without TypeScript 7.0', () => {
    expect(resolveDtsGenerationBackend({ tsgo: true }, '6.0.1')).toBe(
      'tsgo-bin',
    );
  });

  test('should reject disabling tsgo with TypeScript 7.0', () => {
    expect(() =>
      resolveDtsGenerationBackend({ tsgo: false }, '7.0.1-rc'),
    ).toThrow(
      'Can not set "dts.tsgo: false" when using TypeScript 7 or higher.',
    );
  });

  test('should use the TypeScript tsc bin backend for TypeScript 7.1 or higher', () => {
    expect(resolveDtsGenerationBackend({}, '7.1.0')).toBe('tsc-bin');
  });

  test('should read the TypeScript version from cwd', async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'rslib-plugin-dts-'),
    );

    try {
      const typescriptPkgDir = path.join(tempDir, 'node_modules', 'typescript');
      const packageDir = path.join(tempDir, 'packages', 'foo');
      await fs.mkdir(typescriptPkgDir, { recursive: true });
      await fs.mkdir(packageDir, { recursive: true });
      await fs.writeFile(
        path.join(packageDir, 'package.json'),
        JSON.stringify({ name: 'foo' }),
      );
      await fs.writeFile(
        path.join(typescriptPkgDir, 'package.json'),
        JSON.stringify({ name: 'typescript', version: '7.0.1-rc' }),
      );

      const typescriptVersion = readTypescriptVersion(packageDir);

      expect(typescriptVersion).toBe('7.0.1-rc');
      expect(resolveDtsGenerationBackend({}, typescriptVersion)).toBe(
        'tsc-bin',
      );
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
