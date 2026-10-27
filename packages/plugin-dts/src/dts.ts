import { logger } from '@rsbuild/core';
import fs from 'node:fs';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
} from 'node:path';
import type {
  OldApiTsconfigResult,
  DtsEntry,
  DtsGenOptions,
  TsconfigOptionsResult,
} from './types/internal';
import type { DtsRedirect } from './types/options';
import {
  calcLongestCommonPath,
  color,
  ensureTempDeclarationDir,
  mergeAliasWithTsConfigPaths,
} from './utils';

export type PreparedDtsContext = {
  declarationDir: string;
  rootDir: string;
  paths: Record<string, string[]>;
  bundledDtsEntries: Required<DtsEntry>[];
};

export type EmitDtsOptions<
  Tsconfig extends OldApiTsconfigResult | TsconfigOptionsResult,
> = {
  name: string;
  cwd: string;
  configPath: string;
  tsConfigResult: Tsconfig;
  declarationDir: string;
  dtsExtension: string;
  rootDir: string;
  redirect: DtsRedirect;
  paths: Record<string, string[]>;
  banner?: string;
  footer?: string;
  typescriptPath?: string;
};

export async function prepareDtsContext(
  data: DtsGenOptions,
): Promise<PreparedDtsContext> {
  const {
    bundle,
    dtsEntry,
    dtsEmitPath,
    tsconfigPath,
    tsConfigResult,
    name,
    cwd,
    build,
    alias = {},
  } = data;

  // merge alias and tsconfig paths
  const paths = mergeAliasWithTsConfigPaths(
    tsConfigResult.options.paths,
    alias,
  );
  if (Object.keys(paths).length > 0) {
    tsConfigResult.options.paths = paths;
  }

  const { options: rawCompilerOptions } = tsConfigResult;
  const fileNames =
    'fileNames' in tsConfigResult ? tsConfigResult.fileNames : [];

  // The longest common path of all non-declaration input files.
  // If composite is set, the default is instead the directory containing the tsconfig.json file.
  // see https://www.typescriptlang.org/tsconfig/#rootDir
  // Since TypeScript 6, rootDir defaults to the tsconfig directory. This also
  // covers TypeScript 7+ executable backends when TypeScript API fileNames are
  // unavailable.
  const rootDir =
    rawCompilerOptions.rootDir ??
    (rawCompilerOptions.composite
      ? dirname(tsconfigPath)
      : await calcLongestCommonPath(
          fileNames.filter((fileName) => !/\.d\.(ts|mts|cts)$/.test(fileName)),
        )) ??
    dirname(tsconfigPath);

  const resolvedDtsEmitPath = normalize(
    resolve(dirname(tsconfigPath), dtsEmitPath),
  );

  if (build) {
    // do not allow to use bundle declaration files when 'build: true' since temp declarationDir should be set by user in tsconfig
    if (bundle) {
      throw Error(`Can not set "dts.bundle: true" when "dts.build: true"`);
    }

    // can not set '--declarationDir' or '--outDir' when 'build: true'.
    if (
      (!rawCompilerOptions.outDir ||
        normalize(rawCompilerOptions.outDir) !== resolvedDtsEmitPath) &&
      (!rawCompilerOptions.declarationDir ||
        normalize(rawCompilerOptions.declarationDir) !== resolvedDtsEmitPath)
    ) {
      throw Error(
        `Please set "declarationDir": "${dtsEmitPath}" in ${color.underline(
          tsconfigPath,
        )} to keep it same as "dts.distPath" or "output.distPath" field in lib config.`,
      );
    }
  }

  const declarationDir = bundle
    ? ensureTempDeclarationDir(cwd, name)
    : dtsEmitPath;

  const bundledDtsEntries = bundle
    ? (dtsEntry
        .map((entryObj) => {
          const { name: entryName, path: entryPath } = entryObj;
          if (!entryPath) return null;
          const entrySourcePath = isAbsolute(entryPath)
            ? entryPath
            : join(cwd, entryPath);
          const relativePath = relative(rootDir, dirname(entrySourcePath));
          const newPath = join(
            declarationDir,
            relativePath,
            basename(entrySourcePath),
          ).replace(
            /\.(js|mjs|jsx|ts|mts|tsx|cjs|cts|cjsx|ctsx|mjsx|mtsx)$/,
            // TypeScript emits `.d.mts` for `.mts` and `.d.cts` for `.cts` sources.
            (_, ext: string) =>
              ext[0] === 'm' ? '.d.mts' : ext[0] === 'c' ? '.d.cts' : '.d.ts',
          );
          return { name: entryName, path: newPath };
        })
        .filter(Boolean) as Required<DtsEntry>[])
    : [];

  return {
    declarationDir,
    rootDir,
    paths,
    bundledDtsEntries,
  };
}

export async function bundleDtsIfNeeded(
  data: DtsGenOptions,
  context: Pick<PreparedDtsContext, 'bundledDtsEntries'>,
): Promise<void> {
  const {
    bundle,
    name,
    cwd,
    dtsEmitPath,
    tsconfigPath: emitTsconfigPath,
    bundleTsconfigPath,
    dtsExtension = '.d.ts',
    bundledPackages,
    banner,
    footer,
  } = data;

  if (!bundle) {
    return;
  }

  const { bundledDtsEntries } = context;
  const missingEntry = bundledDtsEntries.find(
    (entry) => !fs.existsSync(entry.path),
  );
  if (missingEntry) {
    const error = new Error(
      `Declaration entry file ${color.underline(missingEntry.path)} not found.\nPlease ensure that your tsconfig file ${color.underline(emitTsconfigPath)} is correctly configured to generate declaration files. If needed, a custom tsconfig can be specified using the ${color.cyan('source.tsconfigPath')} option.`,
    );
    // do not log the stack trace, it is not helpful for users
    error.stack = '';
    throw error;
  }

  const { bundleDts } = await import('./apiExtractor');
  await bundleDts({
    name,
    cwd,
    distPath: dtsEmitPath,
    dtsEntry: bundledDtsEntries,
    tsconfigPath: bundleTsconfigPath,
    dtsExtension,
    banner,
    footer,
    bundledPackages,
  });
}

let newApi: typeof import('./apiNew') | undefined;

export async function generateDts(data: DtsGenOptions): Promise<void> {
  const {
    bundle,
    tsconfigPath,
    tsConfigResult,
    name,
    cwd,
    build,
    isWatch,
    dtsExtension = '.d.ts',
    banner,
    footer,
    redirect = {
      path: true,
      extension: true,
    },
    loggerLevel,
    typescriptPath,
  } = data;
  logger.level = loggerLevel;

  if (!isWatch) {
    logger.start(`generating declaration files... ${color.dim(`(${name})`)}`);
  }

  const preparedDtsContext = await prepareDtsContext(data);
  const { declarationDir, rootDir, paths } = preparedDtsContext;

  const onComplete = async (isSuccess: boolean) => {
    if (isSuccess) {
      try {
        await bundleDtsIfNeeded(data, preparedDtsContext);
      } catch (e) {
        logger.error(e);
      }
    }
  };

  const emitOptions = {
    name,
    cwd,
    configPath: tsconfigPath,
    declarationDir,
    dtsExtension,
    redirect,
    rootDir,
    paths,
    banner,
    footer,
    typescriptPath,
  };

  const dtsBackend = data.dtsBackend;
  let hasError: boolean | void;

  switch (dtsBackend) {
    case 'ts7-executable': {
      const { emitDtsWithTs7Executable } = await import('./ts7Executable');
      hasError = await emitDtsWithTs7Executable(
        {
          ...emitOptions,
          tsConfigResult: tsConfigResult as TsconfigOptionsResult,
        },
        onComplete,
        bundle,
        isWatch,
        build,
      );
      break;
    }
    case 'api-new': {
      newApi = await import('./apiNew');
      hasError = await newApi.emitDtsWithNewApi(
        {
          ...emitOptions,
          tsConfigResult: tsConfigResult as TsconfigOptionsResult,
        },
        bundle,
        isWatch,
        data.fileChanges,
      );
      break;
    }
    case 'api-old': {
      const { emitDtsWithOldApi } = await import('./apiOld');
      hasError = await emitDtsWithOldApi(
        {
          ...emitOptions,
          tsConfigResult: tsConfigResult as OldApiTsconfigResult,
        },
        onComplete,
        bundle,
        isWatch,
        build,
      );
      break;
    }
    default:
      throw new Error(
        `Unsupported declaration generation backend: ${dtsBackend}.`,
      );
  }

  if (!hasError && (dtsBackend !== 'api-old' || !isWatch)) {
    await bundleDtsIfNeeded(data, preparedDtsContext);
  }
}

// Gracefully shutdown on disconnect when panic
process.on('disconnect', () => {
  process.exit();
});

const shouldExitAfterGenerate = (data: DtsGenOptions): boolean =>
  !data.isWatch ||
  (data.dtsBackend !== 'api-old' && data.dtsBackend !== 'api-new');

process.on('message', async (data: DtsGenOptions | 'close') => {
  if (data === 'close') {
    newApi?.watchSession?.close();
    process.exit();
  }
  if (!data.cwd) {
    return;
  }
  const persistentNewApi = data.isWatch && data.dtsBackend === 'api-new';
  let status: 'success' | 'error' = 'success';
  try {
    await generateDts(data);
  } catch (e) {
    logger.error(e);
    status = 'error';
  }
  process.send!(
    persistentNewApi
      ? {
          status,
          ...(newApi?.watchSession?.watchDependencies ?? {
            dependencies: [],
            directories: [],
          }),
        }
      : status,
  );
  if (status === 'error' && !persistentNewApi) {
    process.exit(1);
  }
  if (shouldExitAfterGenerate(data)) {
    process.exit();
  }
});
