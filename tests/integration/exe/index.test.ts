import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, onTestFinished, test } from '@rstest/core';
import fse from 'fs-extra';
import {
  buildAndGetResults,
  expectBuildEnd,
  expectFile,
  expectPoll,
  runCli,
} from 'test-helper';

const executableSuffix = process.platform === 'win32' ? '.exe' : '';
const targetExecutablePathSuffix = (platform: 'darwin' | 'linux' | 'win32') =>
  platform === 'win32' ? '.exe' : '';
const multiTargets = [
  {
    platform: 'linux',
    arch: 'x64',
  },
  {
    platform: 'darwin',
    arch: 'arm64',
  },
  {
    platform: 'win32',
    arch: 'x64',
  },
] as const;

const isExeSupportedNodeVersion = (version: string) => {
  const [major = 0, minor = 0, patch = 0] = version
    .replace(/^v/, '')
    .split('.')
    .map((value) => Number.parseInt(value, 10));

  if (major !== 25) {
    return major > 25;
  }

  if (minor !== 7) {
    return minor > 7;
  }

  return patch >= 0;
};

const readExecutableOutput = (filePath: string, args: string[]) => {
  const result = spawnSync(filePath, args, {
    encoding: 'utf8',
  });

  if (result.status !== 0 || result.stderr) {
    return null;
  }

  return result.stdout.trim();
};

const expectExecutableOutput = (
  filePath: string,
  args: string[],
  expected: string,
) =>
  expectPoll(
    () => readExecutableOutput(filePath, args) === expected,
  ).toBeTruthy();

describe.runIf(isExeSupportedNodeVersion(process.version))(
  'experiments.exe',
  async () => {
    const currentNodeVersion = process.version;
    const hostTarget = multiTargets.find(
      (target) =>
        target.platform === process.platform && target.arch === process.arch,
    );
    const hostTargetExecutableName = hostTarget
      ? `hello-cross-${hostTarget.platform}-${hostTarget.arch}-${currentNodeVersion}${targetExecutablePathSuffix(hostTarget.platform)}`
      : null;

    test('should generate and run a cjs executable', async () => {
      const fixturePath = path.resolve(__dirname, 'cjs');

      await buildAndGetResults({
        fixturePath,
        logLevel: 'silent',
      });

      const executablePath = path.join(
        fixturePath,
        'dist',
        `hello-cjs${executableSuffix}`,
      );

      expect(fs.existsSync(executablePath)).toBe(true);
      expect(readExecutableOutput(executablePath, ['arg1', 'arg2'])).toBe(
        'bundled-dependency-cjs:hello-from-sea-cjs:arg1|arg2',
      );
    });

    test('should generate and run an esm executable', async () => {
      const fixturePath = path.resolve(__dirname, 'esm');

      await buildAndGetResults({
        fixturePath,
        logLevel: 'silent',
      });

      const executablePath = path.join(
        fixturePath,
        'dist',
        `hello-esm${executableSuffix}`,
      );

      expect(fs.existsSync(executablePath)).toBe(true);
      expect(readExecutableOutput(executablePath, ['arg1', 'arg2'])).toBe(
        'bundled-dependency-esm:hello-from-sea-esm:arg1|arg2',
      );
    });

    test('should update executable output in watch mode after source changes', async () => {
      const fixturePath = path.resolve(__dirname, 'cjs');
      const tempSrcDir = path.join(fixturePath, 'test-temp-src');
      const tempSrcFile = path.join(tempSrcDir, 'index.ts');
      const tempConfigFile = path.join(
        fixturePath,
        'test-temp-rslib.config.mjs',
      );
      const distDir = path.join(fixturePath, 'dist');
      const executablePath = path.join(
        distDir,
        `hello-watch-cjs${executableSuffix}`,
      );

      await fse.remove(tempSrcDir);
      await fse.remove(distDir);
      await fse.remove(tempConfigFile);

      await fse.outputFile(
        tempSrcFile,
        `console.log('watch-cjs-v1:' + process.argv.slice(2).join('|'));`,
      );
      await fse.outputFile(
        tempConfigFile,
        `import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      output: {
        distPath: './dist',
      },
      experiments: {
        exe: {
          fileName: 'hello-watch-cjs',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './test-temp-src/index.ts',
    },
  },
  performance: {
    buildCache: false,
    printFileSize: false,
  },
});
`,
      );

      const { child } = runCli(`build --watch -c ${tempConfigFile}`, {
        cwd: fixturePath,
      });

      onTestFinished(async () => {
        child.kill();
        await fse.remove(tempSrcDir);
        await fse.remove(tempConfigFile);
        await fse.remove(distDir);
      });

      await expectFile(executablePath);
      await expectExecutableOutput(
        executablePath,
        ['arg1', 'arg2'],
        'watch-cjs-v1:arg1|arg2',
      );

      await fse.outputFile(
        tempSrcFile,
        `console.log('watch-cjs-v2:' + process.argv.slice(2).join('|'));`,
      );

      await expectBuildEnd(child);
      await expectExecutableOutput(
        executablePath,
        ['arg1', 'arg2'],
        'watch-cjs-v2:arg1|arg2',
      );
    });

    test('should generate multi-target executables', async () => {
      const fixturePath = path.resolve(__dirname, 'multi-target');

      await buildAndGetResults({
        fixturePath,
        logLevel: 'silent',
      });

      for (const target of multiTargets) {
        const executablePath = path.join(
          fixturePath,
          'dist',
          `hello-cross-${target.platform}-${target.arch}-${currentNodeVersion}${targetExecutablePathSuffix(target.platform)}`,
        );

        expect(fs.existsSync(executablePath)).toBe(true);
      }
    });

    test.runIf(Boolean(hostTargetExecutableName))(
      'should run host-target executable in multi-target build',
      async () => {
        const fixturePath = path.resolve(__dirname, 'multi-target');
        const hostExecutablePath = path.join(
          fixturePath,
          'dist',
          hostTargetExecutableName!,
        );

        await buildAndGetResults({
          fixturePath,
          logLevel: 'silent',
        });

        expect(fs.existsSync(hostExecutablePath)).toBe(true);
        expect(readExecutableOutput(hostExecutablePath, ['arg1', 'arg2'])).toBe(
          'bundled-dependency-cjs:hello-from-sea-cjs:arg1|arg2',
        );
      },
    );
  },
);
