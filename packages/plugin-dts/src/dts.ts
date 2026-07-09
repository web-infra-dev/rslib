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
import type { DtsRedirect } from './types/options';
import type {
  CompilerApiTsconfigResultForApi,
  DtsEntry,
  DtsGenOptions,
  GetTsconfigTsconfigResultForExecutable,
} from './types/internal';
import {
  calcLongestCommonPath,
  color,
  ensureTempDeclarationDir,
  mergeAliasWithTsConfigPaths,
} from './utils';

const isObject = (obj: unknown): obj is Record<string, any> =>
  Object.prototype.toString.call(obj) === '[object Object]';

export const DEFAULT_EXCLUDED_PACKAGES: string[] = ['@types/react'];

const isExecutableBackend = (
  dtsBackend: DtsGenOptions['dtsBackend'],
): boolean => dtsBackend === 'ts7-executable';

type CalculateBundledPackagesOptions = {
  cwd: string;
  autoExternal: DtsGenOptions['autoExternal'];
  userExternals?: DtsGenOptions['userExternals'];
  overrideBundledPackages?: string[];
};

// use !externals
export const calcBundledPackages = (
  options: CalculateBundledPackagesOptions,
): string[] => {
  const { cwd, autoExternal, userExternals, overrideBundledPackages } = options;

  if (overrideBundledPackages) {
    return overrideBundledPackages;
  }

  let pkgJson: {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
  };

  try {
    const content = fs.readFileSync(join(cwd, 'package.json'), 'utf-8');
    pkgJson = JSON.parse(content);
  } catch {
    logger.warn(
      'The type of third-party packages will not be bundled due to read package.json failed',
    );
    return [];
  }

  const externalOptions = autoExternal
    ? {
        dependencies: true,
        peerDependencies: true,
        optionalDependencies: true,
        devDependencies: false,
        ...(autoExternal === true ? {} : autoExternal),
      }
    : {
        dependencies: false,
        peerDependencies: false,
        devDependencies: false,
      };

  // User externals should not bundled
  // Only handle the case where the externals type is string / (string | RegExp)[] / plain object, function type is too complex.
  const getUserExternalsKeys = (
    value: typeof userExternals,
  ): (string | RegExp)[] => {
    if (!value) {
      return [];
    }

    if (typeof value === 'string' || value instanceof RegExp) {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => getUserExternalsKeys(v));
    }

    if (isObject(userExternals)) {
      return Object.keys(userExternals);
    }
    return [];
  };

  const externals: (string | RegExp)[] = getUserExternalsKeys(userExternals);

  const allDeps: string[] = [];

  for (const type of [
    'dependencies',
    'peerDependencies',
    'devDependencies',
  ] as const) {
    const deps = pkgJson[type] && Object.keys(pkgJson[type]);
    if (deps) {
      if (externalOptions[type]) {
        externals.push(...deps);
      }
      allDeps.push(...deps);
    }
  }

  const bundledPackages = allDeps.filter(
    (d) =>
      !externals.some((e) => (typeof e === 'string' ? d === e : e.test(d))),
  );

  const filteredBundledPackages = Array.from(new Set(bundledPackages)).filter(
    (pkg) => !DEFAULT_EXCLUDED_PACKAGES.includes(pkg),
  );

  return filteredBundledPackages;
};

export type PreparedDtsContext = {
  declarationDir: string;
  rootDir: string;
  paths: Record<string, string[]>;
  bundledDtsEntries: Required<DtsEntry>[];
};

export type EmitDtsOptions<
  Tsconfig extends
    CompilerApiTsconfigResultForApi | GetTsconfigTsconfigResultForExecutable,
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
            '.d.ts',
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
    tsconfigPath,
    dtsExtension = '.d.ts',
    autoExternal = true,
    userExternals,
    apiExtractorOptions,
    banner,
    footer,
  } = data;

  if (!bundle) {
    return;
  }

  const { bundledDtsEntries } = context;

  const { bundleDts } = await import('./apiExtractor');
  await bundleDts({
    name,
    cwd,
    distPath: dtsEmitPath,
    dtsEntry: bundledDtsEntries,
    tsconfigPath,
    dtsExtension,
    banner,
    footer,
    bundledPackages: calcBundledPackages({
      cwd,
      autoExternal,
      userExternals,
      overrideBundledPackages: apiExtractorOptions?.bundledPackages,
    }),
  });
}

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
      extension: false,
    },
    loggerLevel,
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
  };

  const dtsBackend = data.dtsBackend;
  const useExecutable = isExecutableBackend(dtsBackend);
  const hasError = useExecutable
    ? await import('./tsgo').then((mod) =>
        mod.emitDtsTsgo(
          {
            ...emitOptions,
            tsConfigResult:
              tsConfigResult as GetTsconfigTsconfigResultForExecutable,
          },
          onComplete,
          bundle,
          isWatch,
          build,
        ),
      )
    : await import('./tsc').then((mod) =>
        mod.emitDtsTsc(
          {
            ...emitOptions,
            tsConfigResult: tsConfigResult as CompilerApiTsconfigResultForApi,
          },
          onComplete,
          bundle,
          isWatch,
          build,
        ),
      );

  if (useExecutable) {
    if (!hasError) {
      await bundleDtsIfNeeded(data, preparedDtsContext);
    }
  } else {
    if (!isWatch) {
      await bundleDtsIfNeeded(data, preparedDtsContext);
    }
  }
}

// Gracefully shutdown on disconnect when panic
process.on('disconnect', () => {
  process.exit();
});

const shouldExitAfterGenerate = (data: DtsGenOptions): boolean =>
  !data.isWatch || isExecutableBackend(data.dtsBackend);

process.on('message', async (data: DtsGenOptions) => {
  if (!data.cwd) {
    return;
  }

  try {
    await generateDts(data);
  } catch (e) {
    logger.error(e);
    process.send!('error');
    process.exit(1);
  }

  process.send!('success');

  if (shouldExitAfterGenerate(data)) {
    process.exit();
  }
});
