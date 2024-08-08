import { basename, dirname, join, relative } from 'node:path';
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import type { DtsGenOptions } from 'src';
import * as ts from 'typescript';
import { emitDts } from './tsc';
import { ensureTempDeclarationDir, loadTsconfig } from './utils';

export async function generateDts(data: DtsGenOptions): Promise<void> {
  const {
    bundle,
    distPath,
    dtsEntry,
    tsconfigPath,
    name,
    cwd,
    isWatch,
    dtsExtension = '.d.ts',
  } = data;
  logger.start(`Generating DTS... ${color.gray(`(${name})`)}`);
  const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, tsconfigPath);
  if (!configPath) {
    logger.error(`tsconfig.json not found in ${cwd}`);
    throw new Error();
  }
  const { options: rawCompilerOptions } = loadTsconfig(configPath);
  const rootDir = rawCompilerOptions.rootDir ?? 'src';
  const outDir = distPath
    ? distPath
    : rawCompilerOptions.declarationDir || './dist';

  const getDeclarationDir = (bundle: boolean, distPath?: string) => {
    if (bundle) {
      return ensureTempDeclarationDir(cwd);
    }
    return distPath ? distPath : rawCompilerOptions.declarationDir ?? './dist';
  };

  const declarationDir = getDeclarationDir(bundle!, distPath);
  const { name: entryName, path: entryPath } = dtsEntry;
  let entry = '';

  if (bundle === true && entryPath) {
    const entrySourcePath = join(cwd, entryPath);
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
      rootDir,
      declarationDir,
      dtsExtension,
    },
    onComplete,
    bundle,
    isWatch,
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
    process.send!('error');
    process.exit(1);
  }

  process.send!('success');

  if (!data.isWatch) {
    process.exit();
  }
});
