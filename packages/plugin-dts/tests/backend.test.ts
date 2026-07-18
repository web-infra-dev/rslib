import { describe, expect, test } from '@rstest/core';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  readTypescriptVersion,
  resolveDtsGenerationBackend,
  resolveTypescriptPath,
} from '../src/backend';

describe('resolveDtsGenerationBackend', () => {
  const tsgoRequirementMessage = '`dts.tsgo` requires `typescript` >= 7.0.0.';

  test('should preserve backend selection when typescriptPath is unset', () => {
    const cases = [
      [{}, undefined, 'api-old'],
      [{ tsgo: false }, undefined, 'api-old'],
      [{}, '5.9.3', 'api-old'],
      [{ tsgo: false }, '5.9.3', 'api-old'],
      [{}, '6.0.1', 'api-old'],
      [{ tsgo: false }, '6.0.1', 'api-old'],
      [{}, '7.0.2', 'ts7-executable'],
      [{ tsgo: true }, '7.0.2', 'ts7-executable'],
      [{ isolated: true }, undefined, 'isolated'],
      [{ isolated: true }, '6.0.1', 'isolated'],
      [{ isolated: true, tsgo: false }, '7.0.2', 'isolated'],
    ] as const;

    for (const [options, typescriptVersion, expectedBackend] of cases) {
      expect(resolveDtsGenerationBackend(options, typescriptVersion)).toBe(
        expectedBackend,
      );
    }
  });

  test('should use the old compiler api backend for TypeScript 5 and 6', () => {
    expect(resolveDtsGenerationBackend({}, '5.9.3')).toBe('api-old');
    expect(resolveDtsGenerationBackend({}, '6.0.1')).toBe('api-old');
  });

  test('should use the TypeScript 7 executable backend for TypeScript 7.0', () => {
    expect(resolveDtsGenerationBackend({}, '7.0.2')).toBe('ts7-executable');
    expect(resolveDtsGenerationBackend({ tsgo: true }, '7.0.2')).toBe(
      'ts7-executable',
    );
  });

  test('should reject enabling tsgo without TypeScript 7.0 installed', () => {
    expect(() => resolveDtsGenerationBackend({ tsgo: true }, '6.0.1')).toThrow(
      tsgoRequirementMessage,
    );
    expect(() => resolveDtsGenerationBackend({ tsgo: true })).toThrow(
      tsgoRequirementMessage,
    );
  });

  test('should reject disabling tsgo with TypeScript 7.0', () => {
    expect(() => resolveDtsGenerationBackend({ tsgo: false }, '7.0.2')).toThrow(
      'Can not set "dts.tsgo: false" when using `typescript` >= 7.0.0.',
    );
  });

  test('should use the TypeScript 7 executable backend for TypeScript 7.1 or higher', () => {
    expect(resolveDtsGenerationBackend({}, '7.1.0')).toBe('ts7-executable');
  });

  test('should resolve TypeScript from cwd and read its version', async () => {
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
        JSON.stringify({
          name: 'typescript',
          version: '7.0.2',
          exports: {
            '.': './lib/version.cjs',
          },
        }),
      );
      await fs.mkdir(path.join(typescriptPkgDir, 'lib'));
      await fs.writeFile(
        path.join(typescriptPkgDir, 'lib', 'version.cjs'),
        'exports.version = "7.0.2";',
      );

      const typescriptPath = resolveTypescriptPath(packageDir);
      const typescriptVersion = readTypescriptVersion(typescriptPath);

      expect(await fs.realpath(typescriptPath)).toBe(
        await fs.realpath(path.join(typescriptPkgDir, 'lib', 'version.cjs')),
      );
      expect(typescriptVersion).toBe('7.0.2');
      expect(resolveDtsGenerationBackend({}, typescriptVersion)).toBe(
        'ts7-executable',
      );
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  test('should use the configured TypeScript path', async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'rslib-plugin-dts-custom-'),
    );

    try {
      const typescriptPath = path.join(tempDir, 'typescript.cjs');
      await fs.writeFile(typescriptPath, 'exports.version = "6.0.3";');

      expect(resolveTypescriptPath(tempDir, typescriptPath)).toBe(
        typescriptPath,
      );
      expect(readTypescriptVersion(typescriptPath)).toBe('6.0.3');
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  test('should validate the configured TypeScript path', () => {
    expect(() => resolveTypescriptPath('/project', './typescript.js')).toThrow(
      'must be an absolute path',
    );
    expect(() =>
      resolveTypescriptPath('/project', '/path/not-found/typescript.js'),
    ).toThrow('does not exist');
  });

  test('should reject when TypeScript cannot be resolved from cwd', async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'rslib-plugin-dts-missing-'),
    );

    try {
      expect(() => resolveTypescriptPath(tempDir)).toThrow(
        'Failed to resolve TypeScript from the project root',
      );
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  test('should reject typescriptPath with isolated declarations', () => {
    for (const typescriptPath of ['/path/to/typescript.js', '']) {
      expect(() =>
        resolveDtsGenerationBackend(
          {
            isolated: true,
            typescriptPath,
          },
          '6.0.3',
        ),
      ).toThrow('Can not set "dts.typescriptPath" when "dts.isolated: true".');
    }
  });
});
