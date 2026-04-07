import fs from 'node:fs';
import os from 'node:os';
import path, { dirname, join } from 'node:path';
import type { Format, SeaOptions } from '../types';
import type { ExePlatform } from '../types';
import { maybeSignMacBinary, runCommand } from './utils';

export const buildExecutable = async ({
  builderBinaryPath,
  executablePath,
  executableBinaryPath,
  mainFile,
  format,
  root,
  seaOptions,
  targetPlatform,
}: {
  builderBinaryPath: string;
  executablePath: string;
  executableBinaryPath: string;
  mainFile: string;
  format: Extract<Format, 'esm' | 'cjs'>;
  root: string;
  seaOptions: SeaOptions;
  targetPlatform: ExePlatform;
}): Promise<void> => {
  const tempDir = await fs.promises.mkdtemp(join(os.tmpdir(), 'rslib-sea-'));

  try {
    await fs.promises.mkdir(dirname(executablePath), { recursive: true });

    const seaConfigPath = join(tempDir, 'sea-config.json');
    const seaConfig = {
      main: mainFile,
      mainFormat: format === 'esm' ? 'module' : 'commonjs',
      output: executablePath,
      executable: executableBinaryPath,
      disableExperimentalSEAWarning:
        seaOptions.disableExperimentalSEAWarning ?? true,
      ...(seaOptions.useSnapshot ? { useSnapshot: true } : {}),
      ...(seaOptions.useCodeCache ? { useCodeCache: true } : {}),
      ...(seaOptions.execArgv ? { execArgv: seaOptions.execArgv } : {}),
      ...(seaOptions.execArgvExtension
        ? { execArgvExtension: seaOptions.execArgvExtension }
        : {}),
      ...(seaOptions.assets
        ? {
            assets: Object.fromEntries(
              Object.entries(seaOptions.assets).map(([key, value]) => [
                key,
                path.resolve(root, value),
              ]),
            ),
          }
        : {}),
    };

    await fs.promises.writeFile(
      seaConfigPath,
      `${JSON.stringify(seaConfig, null, 2)}\n`,
    );

    await runCommand(builderBinaryPath, ['--build-sea', seaConfigPath]);

    if (targetPlatform === 'darwin') {
      await maybeSignMacBinary(executablePath);
    }
  } finally {
    await fs.promises.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};
