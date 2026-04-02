import path from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { composeCreateRsbuildConfig } from '../src/config';
import { resolveExeTargets } from '../src/exe';
import { resolveTargetBinaries } from '../src/exe/download';
import { resolveExecutableOutputPath } from '../src/exe/utils';
import {
  assertSupportedExeRuntime,
  assertSupportedExeNodeVersion,
  isExeSupportedNodeVersion,
} from '../src/exe/version';

const packageRoot = path.resolve(import.meta.dirname, '..');

type TestLibConfig = Parameters<
  typeof composeCreateRsbuildConfig
>[0]['lib'][number];

const composeTestRslibConfig = (lib: TestLibConfig) =>
  composeCreateRsbuildConfig({
    root: packageRoot,
    lib: [lib],
  });

const withSupportedNodeRuntime = async <T>(fn: () => Promise<T>) => {
  const originalVersions = process.versions;

  Object.defineProperty(process, 'versions', {
    value: {
      ...process.versions,
      node: '25.8.0',
      bun: undefined,
      deno: undefined,
    },
    configurable: true,
  });

  try {
    return await fn();
  } finally {
    Object.defineProperty(process, 'versions', {
      value: originalVersions,
      configurable: true,
    });
  }
};

const withUnsupportedExeHost = async <T>(fn: () => Promise<T>) => {
  const originalPlatform = process.platform;
  const originalArch = process.arch;

  Object.defineProperty(process, 'platform', {
    value: 'freebsd',
    configurable: true,
  });
  Object.defineProperty(process, 'arch', {
    value: 'riscv64',
    configurable: true,
  });

  try {
    return await fn();
  } finally {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: originalArch,
      configurable: true,
    });
  }
};

describe('experiments.exe', () => {
  test('should detect supported Node.js versions', () => {
    expect(isExeSupportedNodeVersion('25.7.0')).toBe(true);
    expect(isExeSupportedNodeVersion('25.7.1')).toBe(true);
    expect(isExeSupportedNodeVersion('26.0.0')).toBe(true);
    expect(isExeSupportedNodeVersion('25.6.9')).toBe(false);
    expect(isExeSupportedNodeVersion('24.9.0')).toBe(false);
  });

  test('should normalize boolean exe to the current target', async () => {
    const targets = await withSupportedNodeRuntime(async () =>
      resolveExeTargets(true, process.cwd()),
    );

    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      arch: process.arch,
      nodeVersion: 'v25.8.0',
      platform: process.platform,
      suffix: null,
    });
  });

  test('should reject unsupported Node.js versions', () => {
    expect(() =>
      assertSupportedExeNodeVersion('25.6.9'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: "experiments.exe" requires Node.js >= 25.7.0, but the current version is 25.6.9.]`,
    );
  });

  test('should reject Bun runtime', () => {
    expect(() =>
      assertSupportedExeRuntime({
        node: '25.8.0',
        bun: '1.2.0',
      } as NodeJS.ProcessVersions & { bun?: string; deno?: string }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: "experiments.exe" only works in Node.js. Bun 1.2.0 is not supported.]`,
    );
  });

  test('should reject Deno runtime', () => {
    expect(() =>
      assertSupportedExeRuntime({
        node: '25.8.0',
        deno: '2.4.0',
      } as NodeJS.ProcessVersions & { bun?: string; deno?: string }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: "experiments.exe" only works in Node.js. Deno 2.4.0 is not supported.]`,
    );
  });

  test('should reject unsupported formats', async () => {
    await expect(
      composeTestRslibConfig({
        format: 'umd',
        experiments: {
          exe: true,
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: "experiments.exe" only supports "esm" and "cjs" formats, but received "umd".]`,
    );
  });

  test('should reject bundleless executables', async () => {
    await expect(
      composeTestRslibConfig({
        format: 'cjs',
        bundle: false,
        experiments: {
          exe: true,
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: "experiments.exe" requires "bundle" to be "true".]`,
    );
  });

  test('should not validate host exe capabilities when exe is disabled', async () => {
    await expect(
      withUnsupportedExeHost(() =>
        composeTestRslibConfig({
          format: 'esm',
        }),
      ),
    ).resolves.toBeTruthy();
  });

  test('should resolve outputPath separately from fileName', () => {
    const resolved = resolveExecutableOutputPath({
      environment: {
        distPath: '/project/dist/esm',
      } as any,
      mainFile: '/project/dist/esm/index.js',
      target: {
        arch: 'arm64',
        fileName: 'my-cli',
        index: 0,
        nodeVersion: 'v25.8.0',
        outputPath: '/project/bin',
        platform: 'darwin',
        seaOptions: {},
        suffix: null,
      },
    });

    expect(resolved).toBe(path.join('/project/bin', 'my-cli'));
  });

  test('should append target suffix when generating multiple targets', () => {
    const resolved = resolveExecutableOutputPath({
      environment: {
        distPath: '/project/dist/esm',
      } as any,
      mainFile: '/project/dist/esm/index.js',
      target: {
        arch: 'x64',
        fileName: 'hello',
        index: 1,
        nodeVersion: 'v25.8.0',
        platform: 'linux',
        seaOptions: {},
        suffix: 'linux-x64-v25.8.0',
      },
    });

    expect(resolved).toBe(
      path.join('/project/dist/esm', 'hello-linux-x64-v25.8.0'),
    );
  });

  test('should append .exe to win32 executable outputs', () => {
    const resolved = resolveExecutableOutputPath({
      environment: {
        distPath: '/project/dist/esm',
      } as any,
      mainFile: '/project/dist/esm/index.js',
      target: {
        arch: 'x64',
        fileName: 'hello',
        index: 1,
        nodeVersion: 'v25.8.0',
        platform: 'win32',
        seaOptions: {},
        suffix: 'win32-x64-v25.8.0',
      },
    });

    expect(resolved).toBe(
      path.join('/project/dist/esm', 'hello-win32-x64-v25.8.0.exe'),
    );
  });

  test('should not append .exe twice for win32 executable outputs', () => {
    const resolved = resolveExecutableOutputPath({
      environment: {
        distPath: '/project/dist/esm',
      } as any,
      mainFile: '/project/dist/esm/index.js',
      target: {
        arch: 'x64',
        fileName: 'hello.exe',
        index: 0,
        nodeVersion: 'v25.8.0',
        platform: 'win32',
        seaOptions: {},
        suffix: null,
      },
    });

    expect(resolved).toBe(path.join('/project/dist/esm', 'hello.exe'));
  });

  test('should normalize multiple targets', async () => {
    const targets = await withSupportedNodeRuntime(async () =>
      resolveExeTargets(
        {
          fileName: 'hello',
          targets: [
            {
              platform: 'linux',
              arch: 'x64',
              nodeVersion: '25.7.0',
            },
            {
              platform: 'darwin',
              arch: 'arm64',
              nodeVersion: '25.8.0',
            },
          ],
        },
        process.cwd(),
      ),
    );

    expect(targets.map((target) => target.suffix)).toEqual([
      'linux-x64-v25.7.0',
      'darwin-arm64-v25.8.0',
    ]);
  });

  test('should resolve current target binaries without downloading', async () => {
    const [target] = await withSupportedNodeRuntime(async () => {
      const targets = resolveExeTargets(
        {
          targets: [
            {
              platform: process.platform as any,
              arch: process.arch as any,
              nodeVersion: '25.8.0',
            },
          ],
        },
        process.cwd(),
      );

      return Promise.all(targets.map((item) => resolveTargetBinaries(item)));
    });

    expect(target?.executableBinaryPath).toBe(process.execPath);
    expect(target?.builderBinaryPath).toBe(process.execPath);
  });

  test('should normalize string target as customBinaryPath shorthand', async () => {
    const targets = await withSupportedNodeRuntime(async () =>
      resolveExeTargets(
        {
          targets: ['./custom/node'],
        },
        '/project',
      ),
    );

    expect(targets[0]).toMatchObject({
      customBinaryPath: path.resolve('/project', './custom/node'),
      nodeVersion: 'v25.8.0',
      platform: process.platform,
      arch: process.arch,
    });
  });

  test('should keep nodeVersion from object target', async () => {
    const targets = await withSupportedNodeRuntime(async () =>
      resolveExeTargets(
        {
          targets: [
            {
              platform: 'linux',
              arch: 'x64',
              nodeVersion: '25.7.0',
            },
          ],
        },
        process.cwd(),
      ),
    );

    expect(targets[0]?.nodeVersion).toBe('v25.7.0');
  });

  test('should reject multiple source entries', async () => {
    await expect(
      composeTestRslibConfig({
        format: 'esm',
        experiments: {
          exe: true,
        },
        source: {
          entry: {
            index: './src/index.ts',
            config: './src/config.ts',
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: "experiments.exe" currently supports a single entry per library, but received 2 entries.]`,
    );
  });
});
