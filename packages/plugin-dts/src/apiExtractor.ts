import { join, relative } from 'node:path';
import {
  Extractor,
  ExtractorConfig,
  type ExtractorResult,
} from '@microsoft/api-extractor';
import { logger } from '@rsbuild/core';

export type BundleOptions = {
  cwd: string;
  outDir: string;
  entry?: string;
  tsconfigPath?: string;
};

export function bundleDts(options: BundleOptions) {
  const {
    cwd,
    outDir,
    entry = 'index.d.ts',
    tsconfigPath = 'tsconfig.json',
  } = options;
  const untrimmedFilePath = join(cwd, relative(cwd, outDir), 'index.d.ts');
  const internalConfig = {
    mainEntryPointFilePath: entry,
    // TODO: use !externals
    // bundledPackages: [],
    dtsRollup: {
      enabled: true,
      untrimmedFilePath,
    },
    compiler: {
      tsconfigFilePath: join(cwd, tsconfigPath),
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
    throw new Error('API Extractor rollup error');
  }

  logger.info(
    `API Extractor writing package typings succeeded: ${untrimmedFilePath}`,
  );
}
