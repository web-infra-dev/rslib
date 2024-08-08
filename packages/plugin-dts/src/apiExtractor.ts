import { join, relative } from 'node:path';
import {
  Extractor,
  ExtractorConfig,
  type ExtractorResult,
} from '@microsoft/api-extractor';
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import { getTimeCost } from './utils';

export type BundleOptions = {
  name: string;
  cwd: string;
  outDir: string;
  dtsExtension: string;
  entry?: string;
  tsconfigPath?: string;
};

export async function bundleDts(options: BundleOptions): Promise<void> {
  const {
    name,
    cwd,
    outDir,
    dtsExtension,
    entry = 'index.d.ts',
    tsconfigPath = 'tsconfig.json',
  } = options;
  try {
    const start = Date.now();
    const untrimmedFilePath = join(
      cwd,
      relative(cwd, outDir),
      `index${dtsExtension}`,
    );
    const internalConfig = {
      mainEntryPointFilePath: entry,
      // TODO: use !externals
      // bundledPackages: [],
      dtsRollup: {
        enabled: true,
        untrimmedFilePath,
      },
      compiler: {
        tsconfigFilePath: tsconfigPath.includes(cwd)
          ? tsconfigPath
          : join(cwd, tsconfigPath),
      },
      projectFolder: cwd,
    };

    const extractorConfig = ExtractorConfig.prepare({
      configObject: internalConfig,
      configObjectFullPath: undefined,
      packageJsonFullPath: join(cwd, 'package.json'),
    });

    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
    });

    if (!extractorResult.succeeded) {
      throw new Error(`API Extractor error. ${color.gray(`(${name})`)}`);
    }

    logger.info(
      `API Extractor bundle DTS succeeded: ${color.cyan(untrimmedFilePath)} in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
    );
  } catch (e) {
    logger.error('API Extractor', e);
    throw new Error('API Extractor rollup error');
  }
}
