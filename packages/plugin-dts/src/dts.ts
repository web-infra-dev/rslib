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
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import ts from 'typescript';
import type { DtsGenOptions } from './index';
import { emitDts } from './tsc';
import {
  calcLongestCommonPath,
  ensureTempDeclarationDir,
  loadTsconfig,
} from './utils';

const isObject = (obj: unknown): obj is Record<string, any> =>
  Object.prototype.toString.call(obj) === '[object Object]';

// use !externals
export const calcBundledPackages = (options: {
  autoExternal: DtsGenOptions['autoExternal'];
  cwd: string;
  userExternals?: DtsGenOptions['userExternals'];
}): string[] => {
  const { autoExternal, cwd, userExternals } = options;

  let pkgJson: {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
  };

  try {
    const content = fs.readFileSync(join(cwd, 'package.json'), 'utf-8');
    pkgJson = JSON.parse(content);
  } catch (err) {
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

  return Array.from(new Set(bundledPackages));
};

export async function generateDts(data: DtsGenOptions): Promise<void> {
  const {
    bundle,
    distPath,
    dtsEntry,
    tsconfigPath,
    name,
    cwd,
    build,
    isWatch,
    dtsExtension = '.d.ts',
    autoExternal = true,
    userExternals,
    banner,
    footer,
  } = data;
  logger.start(`Generating DTS... ${color.gray(`(${name})`)}`);
  const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, tsconfigPath);
  if (!configPath) {
    logger.error(`tsconfig.json not found in ${cwd}`);
    throw new Error();
  }
  const { options: rawCompilerOptions, fileNames } = loadTsconfig(configPath);

  // The longest common path of all non-declaration input files.
  // If composite is set, the default is instead the directory containing the tsconfig.json file.
  // see https://www.typescriptlang.org/tsconfig/#rootDir
  const rootDir =
    rawCompilerOptions.rootDir ??
    (rawCompilerOptions.composite
      ? dirname(configPath)
      : await calcLongestCommonPath(
          fileNames.filter((fileName) => !/\.d\.(ts|mts|cts)$/.test(fileName)),
        )) ??
    dirname(configPath);

  const outDir = distPath
    ? distPath
    : rawCompilerOptions.declarationDir || './dist';

  if (build) {
    // do not allow to use bundle DTS when 'build: true' since temp declarationDir should be set by user in tsconfig
    if (bundle) {
      throw Error(`Can not set "dts.bundle: true" when "dts.build: true"`);
    }

    // can not set '--declarationDir' or '--outDir' when 'build: true'.
    if (
      (!rawCompilerOptions.outDir ||
        normalize(rawCompilerOptions.outDir) !==
          normalize(resolve(dirname(configPath), outDir))) &&
      (!rawCompilerOptions.declarationDir ||
        normalize(rawCompilerOptions.declarationDir) !==
          normalize(resolve(dirname(configPath), outDir)))
    ) {
      const info =
        rawCompilerOptions.outDir && !rawCompilerOptions.declarationDir
          ? 'outDir'
          : 'declarationDir';
      throw Error(
        `Please set ${info}: "${outDir}" in ${color.underline(
          configPath,
        )} to keep it same as "dts.distPath" or "output.distPath" field in lib config.`,
      );
    }
  }

  const getDeclarationDir = (bundle: boolean, distPath?: string) => {
    if (bundle) {
      return ensureTempDeclarationDir(cwd);
    }
    return distPath
      ? distPath
      : (rawCompilerOptions.declarationDir ?? './dist');
  };

  const declarationDir = getDeclarationDir(bundle!, distPath);
  const { name: entryName, path: entryPath } = dtsEntry;
  let entry = '';

  if (bundle === true && entryPath) {
    const entrySourcePath = isAbsolute(entryPath)
      ? entryPath
      : join(cwd, entryPath);
    const relativePath = relative(rootDir, dirname(entrySourcePath));
    entry = join(
      declarationDir!,
      relativePath,
      basename(entrySourcePath),
    ).replace(
      /\.(js|mjs|jsx|ts|mts|tsx|cjs|cts|cjsx|ctsx|mjsx|mtsx)$/,
      '.d.ts',
    );
  }

  const bundleDtsIfNeeded = async () => {
    if (bundle === true) {
      const { bundleDts } = await import('./apiExtractor');
      await bundleDts({
        name,
        cwd,
        outDir,
        dtsEntry: {
          name: entryName,
          path: entry,
        },
        tsconfigPath,
        dtsExtension,
        banner,
        footer,
        bundledPackages: calcBundledPackages({
          autoExternal,
          cwd,
          userExternals,
        }),
      });
    }
  };

  const onComplete = async (isSuccess: boolean) => {
    if (isSuccess) {
      await bundleDtsIfNeeded();
    }
  };

  await emitDts(
    {
      name,
      cwd,
      configPath,
      declarationDir,
      dtsExtension,
      banner,
      footer,
    },
    onComplete,
    bundle,
    isWatch,
    build,
  );

  if (!isWatch) {
    await bundleDtsIfNeeded();
  }
}

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

  if (!data.isWatch) {
    process.exit();
  }
});
