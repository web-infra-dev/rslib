import { describe, expect, it } from 'vitest';
import type { PluginDtsOptions } from '../src/index';
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
