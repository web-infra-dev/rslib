import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import type { ExeArch, ExePlatform } from '../types';
import type { NormalizedExeTarget, ResolvedExeTarget } from './types';
import { readBinaryVersion, runCommand } from './utils';
import {
  assertSupportedExeNodeVersion,
  compareNodeVersions,
  getCurrentExeArch,
  getCurrentExePlatform,
  getExeCacheDir,
  normalizeNodeVersion,
} from './version';

const resolveArchiveInfo = ({
  arch,
  nodeVersion,
  platform,
}: {
  arch: ExeArch;
  nodeVersion: string;
  platform: ExePlatform;
}) => {
  const normalizedVersion = normalizeNodeVersion(nodeVersion);
  const releasePlatform = platform === 'win32' ? 'win' : platform;
  const baseName = `node-${normalizedVersion}-${releasePlatform}-${arch}`;
  const archiveName =
    platform === 'win32' ? `${baseName}.zip` : `${baseName}.tar.gz`;
  const archiveDir = path.join(
    getExeCacheDir(),
    normalizedVersion,
    releasePlatform,
    arch,
  );
  const archivePath = path.join(archiveDir, archiveName);
  const extractDir = path.join(archiveDir, baseName);
  const binaryPath =
    platform === 'win32'
      ? path.join(extractDir, 'node.exe')
      : path.join(extractDir, 'bin', 'node');

  return {
    archivePath,
    binaryPath,
    extractDir,
    url: `https://nodejs.org/dist/${normalizedVersion}/${archiveName}`,
  };
};

const downloadArchive = async (url: string, archivePath: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download "${url}" for "experiments.exe": ${response.status} ${response.statusText}.`,
    );
  }

  if (!response.body) {
    throw new Error(
      `Failed to download "${url}" for "experiments.exe": response body is empty.`,
    );
  }

  await fs.promises.mkdir(path.dirname(archivePath), { recursive: true });

  try {
    await pipeline(
      Readable.fromWeb(response.body as WebReadableStream<Uint8Array>),
      fs.createWriteStream(archivePath),
    );
  } catch (error) {
    await fs.promises.rm(archivePath, { force: true });
    throw error;
  }
};

const extractArchive = async ({
  archivePath,
  extractDir,
  platform,
}: {
  archivePath: string;
  extractDir: string;
  platform: ExePlatform;
}) => {
  await fs.promises.mkdir(path.dirname(extractDir), { recursive: true });

  if (platform === 'win32') {
    if (process.platform === 'win32') {
      await runCommand('powershell', [
        '-NoLogo',
        '-NoProfile',
        '-Command',
        `Expand-Archive -Path "${archivePath}" -DestinationPath "${path.dirname(extractDir)}" -Force`,
      ]);
      return;
    }

    await runCommand('unzip', [
      '-q',
      archivePath,
      '-d',
      path.dirname(extractDir),
    ]);
    return;
  }

  await runCommand('tar', [
    '-xzf',
    archivePath,
    '-C',
    path.dirname(extractDir),
  ]);
};

const ensureDownloadedBinary = async ({
  arch,
  nodeVersion,
  platform,
}: {
  arch: ExeArch;
  nodeVersion: string;
  platform: ExePlatform;
}) => {
  const archiveInfo = resolveArchiveInfo({
    arch,
    nodeVersion,
    platform,
  });

  if (fs.existsSync(archiveInfo.binaryPath)) {
    return archiveInfo.binaryPath;
  }

  if (!fs.existsSync(archiveInfo.archivePath)) {
    await downloadArchive(archiveInfo.url, archiveInfo.archivePath);
  }

  await extractArchive({
    archivePath: archiveInfo.archivePath,
    extractDir: archiveInfo.extractDir,
    platform,
  });

  if (!fs.existsSync(archiveInfo.binaryPath)) {
    throw new Error(
      `Failed to locate downloaded Node.js executable "${archiveInfo.binaryPath}" for "experiments.exe".`,
    );
  }

  if (platform !== 'win32') {
    await fs.promises.chmod(archiveInfo.binaryPath, 0o755);
  }

  return archiveInfo.binaryPath;
};

export const resolveTargetBinaries = async (
  target: NormalizedExeTarget,
): Promise<ResolvedExeTarget> => {
  const currentPlatform = getCurrentExePlatform();
  const currentArch = getCurrentExeArch();
  const currentNodeVersion = normalizeNodeVersion(process.versions.node);

  if (target.customBinaryPath) {
    const binaryVersion = normalizeNodeVersion(
      await readBinaryVersion(target.customBinaryPath),
    );
    assertSupportedExeNodeVersion(binaryVersion);

    // `--build-sea` must run with a Node binary that is executable on the host
    // machine, even when the final executable template comes from a custom path.
    const builderBinaryPath =
      compareNodeVersions(binaryVersion, currentNodeVersion) === 0
        ? process.execPath
        : await ensureDownloadedBinary({
            arch: currentArch,
            nodeVersion: binaryVersion,
            platform: currentPlatform,
          });

    return {
      ...target,
      executableBinaryPath: target.customBinaryPath,
      builderBinaryPath,
      nodeVersion: binaryVersion,
      suffix: target.suffix
        ? `${target.platform}-${target.arch}-${binaryVersion}`
        : null,
    };
  }

  assertSupportedExeNodeVersion(target.nodeVersion);

  const sameCurrentRuntime =
    currentPlatform === target.platform &&
    currentArch === target.arch &&
    currentNodeVersion === target.nodeVersion;

  // The executable template follows the target platform, while the builder
  // binary must stay runnable on the current host and use the same version.
  const targetBinaryPath = sameCurrentRuntime
    ? process.execPath
    : await ensureDownloadedBinary({
        arch: target.arch,
        nodeVersion: target.nodeVersion,
        platform: target.platform,
      });

  const builderBinaryPath = sameCurrentRuntime
    ? process.execPath
    : compareNodeVersions(target.nodeVersion, currentNodeVersion) === 0
      ? process.execPath
      : await ensureDownloadedBinary({
          arch: currentArch,
          nodeVersion: target.nodeVersion,
          platform: currentPlatform,
        });

  return {
    ...target,
    executableBinaryPath: targetBinaryPath,
    builderBinaryPath,
  };
};
