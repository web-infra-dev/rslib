import { join, relative } from 'node:path';
import type * as ApiExtractor from '@microsoft/api-extractor';
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import type { DtsEntry } from './index';
import { addBannerAndFooter, getTimeCost } from './utils';

const logPrefixApiExtractor = color.dim('[api-extractor]');

export type BundleOptions = {
  name: string;
  cwd: string;
  distPath: string;
  dtsExtension: string;
  banner?: string;
  footer?: string;
  dtsEntry: DtsEntry[];
  tsconfigPath?: string;
  bundledPackages?: string[];
};

export async function bundleDts(options: BundleOptions): Promise<void> {
  let apiExtractor: typeof ApiExtractor | undefined;
  try {
    apiExtractor = await import('@microsoft/api-extractor');
  } catch {
    const error = new Error(
      `${color.cyan('@microsoft/api-extractor')} is required when ${color.cyan('dts.bundle')} is set to ${color.cyan('true')}, please make sure it is installed. You could check https://rslib.rs/guide/advanced/dts#how-to-generate-declaration-files-in-rslib for more details.`,
    );
    // do not log the stack trace, it is not helpful for users
    error.stack = '';
    throw error;
  }

  const { Extractor, ExtractorConfig, ExtractorLogLevel } = apiExtractor;
  const {
    name,
    cwd,
    distPath,
    dtsExtension,
    banner,
    footer,
    dtsEntry,
    tsconfigPath = 'tsconfig.json',
    bundledPackages = [],
  } = options;
  try {
    await Promise.all(
      dtsEntry.map(async (entry) => {
        const start = Date.now();
        const untrimmedFilePath = join(
          cwd,
          relative(cwd, distPath),
          `${entry.name}${dtsExtension}`,
        );
        const mainEntryPointFilePath = entry.path!.replace(/\?.*$/, '');
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

        const extractorResult: ApiExtractor.ExtractorResult = Extractor.invoke(
          extractorConfig,
          {
            localBuild: true,
            messageCallback(message) {
              /**
               * message.text is readonly, we can not add prefix
               * do not log below two cases
               * 1. Analysis will use the bundled TypeScript version 5.7.3
               * 2. The target project appears to use TypeScript 5.8.2 which is newer than the bundled compiler engine; consider upgrading API Extractor.
               */
              if (
                message.messageId === 'console-compiler-version-notice' ||
                message.messageId === 'console-preamble'
              ) {
                message.logLevel = ExtractorLogLevel.None;
              }
            },
          },
        );

        if (!extractorResult.succeeded) {
          throw new Error(`API Extractor error. ${color.gray(`(${name})`)}`);
        }

        await addBannerAndFooter(untrimmedFilePath, banner, footer);

        logger.ready(
          `declaration files bundled successfully: ${color.cyan(relative(cwd, untrimmedFilePath))} in ${getTimeCost(start)} ${color.gray(`(${name})`)}`,
        );
      }),
    );
  } catch (e) {
    const error = new Error(`${logPrefixApiExtractor} ${e}`);
    // do not log the stack trace, it is not helpful for users
    error.stack = '';
    throw error;
  }
}
