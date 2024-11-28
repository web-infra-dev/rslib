import { join, relative } from 'node:path';
import {
  Extractor,
  ExtractorConfig,
  type ExtractorResult,
} from '@microsoft/api-extractor';
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import type { DtsEntry } from './index';
import { addBannerAndFooter, getTimeCost } from './utils';

export type BundleOptions = {
  name: string;
  cwd: string;
  distPath: string;
  dtsExtension: string;
  banner?: string;
  footer?: string;
  dtsEntry: DtsEntry;
  tsconfigPath?: string;
  bundledPackages?: string[];
};

export async function bundleDts(options: BundleOptions): Promise<void> {
  const {
    name,
    cwd,
    distPath,
    dtsExtension,
    banner,
    footer,
    dtsEntry = {
      name: 'index',
      path: 'index.d.ts',
    },
    tsconfigPath = 'tsconfig.json',
    bundledPackages = [],
  } = options;
  try {
    const start = Date.now();
    const untrimmedFilePath = join(
      cwd,
      relative(cwd, distPath),
      `${dtsEntry.name}${dtsExtension}`,
    );
    const mainEntryPointFilePath = dtsEntry.path!.replace(/\?.*$/, '')!;
    const internalConfig = {
      mainEntryPointFilePath,
      bundledPackages,
      dtsRollup: {
        enabled: true,
        untrimmedFilePath,
      },
      compiler: {
        tsconfigFilePath: tsconfigPath,
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

    await addBannerAndFooter(untrimmedFilePath, banner, footer);

    logger.info(
      `API Extractor bundle DTS succeeded: ${color.cyan(untrimmedFilePath)} in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
    );
  } catch (e) {
    logger.error('API Extractor Error');
    throw new Error(`${e}`);
  }
}
