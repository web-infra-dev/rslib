import { describe, expect, it } from '@rstest/core';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareDtsContext } from '../src/dts';
import type { PluginDtsOptions } from '../src/index';
import type { DtsGenOptions } from '../src/types/internal';
import { getDtsEmitPath } from '../src/utils';

describe('getDtsEmitPath', () => {
  const baseConfig = {
    output: {
      distPath: {
        root: '/dist-config',
      },
    },
  };
  const declarationDir = '/dist-declarationDir';

  it('should return options.distPath with the highest priority', () => {
    const options: PluginDtsOptions = {
      distPath: '/dist-options',
    };
    const result = getDtsEmitPath(
      options.distPath,
      declarationDir,
      baseConfig.output.distPath.root,
    );
    expect(result).toBe('/dist-options');
  });

  it('should return declarationDir when options.distPath is undefined', () => {
    const options: PluginDtsOptions = {};
    const result = getDtsEmitPath(
      options.distPath,
      declarationDir,
      baseConfig.output.distPath.root,
    );
    expect(result).toBe('/dist-declarationDir');
  });

  it('should return config.output.distPath.root when both options.distPath and declarationDir are undefined', () => {
    const options: PluginDtsOptions = {};
    const result = getDtsEmitPath(
      options.distPath,
      undefined,
      baseConfig.output.distPath.root,
    );
    expect(result).toBe('/dist-config');
  });
});

describe('prepareDtsContext', () => {
  it('should resolve bundled entries of .mts and .cts sources to .d.mts and .d.cts', async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'rslib-plugin-dts-'));

    try {
      const { declarationDir, bundledDtsEntries } = await prepareDtsContext({
        bundle: true,
        name: 'esm',
        cwd,
        dtsEmitPath: 'dist',
        tsconfigPath: path.join(cwd, 'tsconfig.json'),
        tsConfigResult: { options: { rootDir: path.join(cwd, 'src') } },
        dtsEntry: [
          { name: 'index', path: 'src/index.ts' },
          { name: 'esm', path: 'src/esm.mts' },
          { name: 'cjs', path: 'src/cjs.cts' },
        ],
      } as DtsGenOptions);

      expect(bundledDtsEntries).toEqual([
        { name: 'index', path: path.join(declarationDir, 'index.d.ts') },
        { name: 'esm', path: path.join(declarationDir, 'esm.d.mts') },
        { name: 'cjs', path: path.join(declarationDir, 'cjs.d.cts') },
      ]);
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });
});
