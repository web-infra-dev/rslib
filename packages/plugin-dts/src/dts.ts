import { basename, dirname, join, relative } from 'node:path';
import { logger } from '@rsbuild/core';
import color from 'picocolors';
import type { DtsGenOptions } from 'src';
import * as ts from 'typescript';
import { emitDts } from './tsc';
import { ensureTempDeclarationDir, loadTsconfig } from './utils';

export async function generateDts(data: DtsGenOptions) {
  const { options: pluginOptions, cwd, isWatch, name } = data;
  logger.start(`Generating DTS... ${color.gray(`(${name})`)}`);
  const { tsconfigPath, distPath, bundle, entryPath } = pluginOptions;
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
  let entry = '';

  if (bundle === true && entryPath) {
    const entrySourcePath = join(cwd, entryPath);
    const relativePath = relative(rootDir, dirname(entrySourcePath));
    entry = join(
      declarationDir!,
      relativePath,
      basename(entrySourcePath),
    ).replace(/\.(m?js|jsx?|m?ts|tsx?|c?js)$/, '.d.ts');
  }

  const bundleDtsIfNeeded = async () => {
    if (bundle === true) {
      const { bundleDts } = await import('./apiExtractor');
      bundleDts({
        cwd,
        outDir,
        entry,
        tsconfigPath,
      });
    }
  };

  const onComplete = async (isSuccess: boolean) => {
    if (isSuccess) {
      await bundleDtsIfNeeded();
    }
  };

  emitDts(
    {
      name,
      cwd,
      configPath,
      rootDir,
      declarationDir,
    },
    onComplete,
    isWatch,
  );

  if (!isWatch) {
    await bundleDtsIfNeeded();
  }
}

process.on('message', async (data: DtsGenOptions) => {
  if (!data.options) {
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
