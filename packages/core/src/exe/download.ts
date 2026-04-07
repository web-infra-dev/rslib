import { createHash } from 'node:crypto';
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

const inFlightBinaryDownloads = new Map<string, Promise<string>>();
const shasumManifestCache = new Map<string, Promise<Map<string, string>>>();

const resolveCustomBinaryVersion = async (
  customBinaryPath: string,
): Promise<string> => {
  try {
    return normalizeNodeVersion(await readBinaryVersion(customBinaryPath));
  } catch (error) {
    const originalError =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `"experiments.exe" could not determine the Node.js version of custom binary "${customBinaryPath}".\nOriginal error: ${originalError}`,
    );
  }
};

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
    archiveName,
    archivePath,
    binaryPath,
    extractDir,
    url: `https://nodejs.org/dist/${normalizedVersion}/${archiveName}`,
  };
};

const getShasumManifest = async (
  nodeVersion: string,
): Promise<Map<string, string>> => {
  const normalizedVersion = normalizeNodeVersion(nodeVersion);
  const cachedManifest = shasumManifestCache.get(normalizedVersion);

  if (cachedManifest) {
    return cachedManifest;
  }

  const manifestPromise = (async () => {
    const manifestUrl = `https://nodejs.org/dist/${normalizedVersion}/SHASUMS256.txt`;
    const response = await fetch(manifestUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download "${manifestUrl}" for "experiments.exe": ${response.status} ${response.statusText}.`,
      );
    }

    const manifestText = await response.text();
    const checksums = new Map<string, string>();

    for (const line of manifestText.split(/\r?\n/)) {
      const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i);

      if (!match?.[1] || !match[2]) {
        continue;
      }

      checksums.set(match[2], match[1].toLowerCase());
    }

    return checksums;
  })();

  shasumManifestCache.set(normalizedVersion, manifestPromise);

  try {
    return await manifestPromise;
  } catch (error) {
    shasumManifestCache.delete(normalizedVersion);
    throw error;
  }
};

const getExpectedArchiveChecksum = async ({
  archiveName,
  nodeVersion,
}: {
  archiveName: string;
  nodeVersion: string;
}) => {
  const checksums = await getShasumManifest(nodeVersion);
  const checksum = checksums.get(archiveName);

  if (!checksum) {
    throw new Error(
      `Failed to find checksum for "${archiveName}" in Node.js SHASUMS256.txt for "experiments.exe".`,
    );
  }

  return checksum;
};

const calculateFileSha256 = async (filePath: string): Promise<string> => {
  const hash = createHash('sha256');
  const stream = fs.createReadStream(filePath);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest('hex');
};

const verifyArchiveChecksum = async ({
  archivePath,
  expectedChecksum,
}: {
  archivePath: string;
  expectedChecksum: string;
}) => {
  const actualChecksum = await calculateFileSha256(archivePath);

  if (actualChecksum !== expectedChecksum) {
    throw new Error(
      `Checksum mismatch for "${archivePath}" in "experiments.exe": expected ${expectedChecksum}, received ${actualChecksum}.`,
    );
  }
};

const downloadArchive = async ({
  archivePath,
  expectedChecksum,
  url,
}: {
  archivePath: string;
  expectedChecksum: string;
  url: string;
}) => {
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
  const tempArchivePath = `${archivePath}.tmp-${process.pid}-${Date.now()}`;

  try {
    await pipeline(
      Readable.fromWeb(response.body as WebReadableStream<Uint8Array>),
      fs.createWriteStream(tempArchivePath),
    );
    await verifyArchiveChecksum({
      archivePath: tempArchivePath,
      expectedChecksum,
    });
    await fs.promises.rename(tempArchivePath, archivePath);
  } catch (error) {
    await fs.promises.rm(tempArchivePath, { force: true });
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
  const expectedChecksum = await getExpectedArchiveChecksum({
    archiveName: archiveInfo.archiveName,
    nodeVersion,
  });

  const inFlightKey = archiveInfo.archivePath;
  const inFlightDownload = inFlightBinaryDownloads.get(inFlightKey);

  if (inFlightDownload) {
    return inFlightDownload;
  }

  const downloadPromise = (async () => {
    if (fs.existsSync(archiveInfo.binaryPath)) {
      return archiveInfo.binaryPath;
    }

    if (fs.existsSync(archiveInfo.archivePath)) {
      try {
        await verifyArchiveChecksum({
          archivePath: archiveInfo.archivePath,
          expectedChecksum,
        });
      } catch {
        await fs.promises.rm(archiveInfo.archivePath, { force: true });
      }
    }

    if (!fs.existsSync(archiveInfo.archivePath)) {
      await downloadArchive({
        archivePath: archiveInfo.archivePath,
        expectedChecksum,
        url: archiveInfo.url,
      });
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
  })();

  inFlightBinaryDownloads.set(inFlightKey, downloadPromise);

  try {
    return await downloadPromise;
  } finally {
    if (inFlightBinaryDownloads.get(inFlightKey) === downloadPromise) {
      inFlightBinaryDownloads.delete(inFlightKey);
    }
  }
};

export const resolveTargetBinaries = async (
  target: NormalizedExeTarget,
): Promise<ResolvedExeTarget> => {
  const currentPlatform = getCurrentExePlatform();
  const currentArch = getCurrentExeArch();
  const currentNodeVersion = normalizeNodeVersion(process.versions.node);

  if (target.customBinaryPath) {
    const binaryVersion = await resolveCustomBinaryVersion(
      target.customBinaryPath,
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
