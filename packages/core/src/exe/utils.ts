import { spawn } from 'node:child_process';
import path from 'node:path';
import type { EnvironmentContext, Rspack } from '@rsbuild/core';
import { color } from '../utils/color';
import type { CommandResult, NormalizedExeTarget } from './types';

export const isJavaScriptOutputFile = (file: string): boolean => {
  return /\.(cjs|mjs|js|jsx)$/.test(file);
};

export const formatBinarySize = (size: number): string => {
  if (size >= 1000 * 1000) {
    return `${(size / (1000 * 1000)).toFixed(1)} MB`;
  }

  if (size >= 1000) {
    return `${(size / 1000).toFixed(1)} kB`;
  }

  return `${size} B`;
};

const prettyTime = (seconds: number): string => {
  const format = (time: string) => color.bold(time);

  if (seconds < 10) {
    const digits = seconds >= 0.01 ? 2 : 3;
    return `${format(seconds.toFixed(digits))} s`;
  }

  if (seconds < 60) {
    return `${format(seconds.toFixed(1))} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const minutesLabel = `${format(minutes.toFixed(0))} m`;
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return minutesLabel;
  }

  const secondsLabel = `${format(
    remainingSeconds.toFixed(remainingSeconds % 1 === 0 ? 0 : 1),
  )} s`;

  return `${minutesLabel} ${secondsLabel}`;
};

export const getTimeCost = (start: number): string => {
  return prettyTime((Date.now() - start) / 1000);
};

export const runCommand = async (
  command: string,
  args: string[],
): Promise<CommandResult> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `Command "${[command, ...args].join(' ')}" exited with code ${code}.${stderr ? `\n${stderr.trim()}` : ''}`,
        ),
      );
    });
  });
};

export const ensureBinaryVersion = async (
  executableBinaryPath: string,
  builderBinaryPath: string = process.execPath,
): Promise<void> => {
  const [resolvedVersion, builderVersion] = await Promise.all([
    readBinaryVersion(executableBinaryPath),
    readBinaryVersion(builderBinaryPath),
  ]);

  if (resolvedVersion !== builderVersion) {
    throw new Error(
      `"experiments.exe" requires the target executable and builder Node.js binaries to use the same version, but received "${resolvedVersion}" from "${executableBinaryPath}" and "${builderVersion}" from "${builderBinaryPath}".`,
    );
  }
};

export const readBinaryVersion = async (
  executableBinaryPath: string,
): Promise<string> => {
  const { stdout } = await runCommand(executableBinaryPath, ['--version']);
  return stdout.trim().replace(/^v/, '');
};

export const maybeSignMacBinary = async (filePath: string): Promise<void> => {
  if (process.platform !== 'darwin') {
    return;
  }

  await runCommand('codesign', ['--sign', '-', filePath]);
};

export const resolveExecutableOutputPath = ({
  environment,
  mainFile,
  target,
}: {
  environment: EnvironmentContext;
  mainFile: string;
  target: NormalizedExeTarget;
}): string => {
  const builtEntryFileName = path.parse(mainFile).name;
  const baseFileName = target.fileName ?? builtEntryFileName;

  if (path.isAbsolute(baseFileName) || /[\\/]/.test(baseFileName)) {
    throw new Error(
      `"experiments.exe.fileName" must be a file name, but received "${baseFileName}".`,
    );
  }

  const parsedName = path.parse(baseFileName);
  const suffixedBaseName = target.suffix
    ? `${parsedName.name}-${target.suffix}`
    : parsedName.name;
  const rawFileName = parsedName.ext
    ? `${suffixedBaseName}${parsedName.ext}`
    : suffixedBaseName;

  const normalizedFileName =
    target.platform === 'win32' && !rawFileName.toLowerCase().endsWith('.exe')
      ? `${rawFileName}.exe`
      : rawFileName;

  return path.join(
    target.outputPath ?? environment.distPath,
    normalizedFileName,
  );
};

export const resolveBuiltMainFile = ({
  environment,
  entryName,
  stats,
}: {
  environment: EnvironmentContext;
  entryName: string;
  stats: Rspack.Stats;
}): string => {
  const entrypoint = stats.compilation.entrypoints.get(entryName);

  if (!entrypoint) {
    throw new Error(
      `Unable to find the emitted entrypoint "${entryName}" for "${environment.name}".`,
    );
  }

  const entryFiles = entrypoint.getFiles().filter(isJavaScriptOutputFile);

  if (entryFiles.length !== 1 || !entryFiles[0]) {
    throw new Error(
      `"experiments.exe" expects a single bundled JavaScript entry file, but "${environment.name}" emitted ${entryFiles.length} JavaScript files for entry "${entryName}": ${entryFiles.join(', ') || '(none)'}.`,
    );
  }

  return path.join(
    stats.compilation.outputOptions.path ?? environment.distPath,
    entryFiles[0],
  );
};
