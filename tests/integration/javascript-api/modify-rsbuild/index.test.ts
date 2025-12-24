import type { RsbuildPlugin } from '@rsbuild/core';
import { createRslib } from '@rslib/core';
import { describe, expect, test } from '@rstest/core';

describe('onAfterCreateRsbuild', async () => {
  test('should allow to call `onAfterBuild` via Rsbuild instance', async () => {
    let afterBuildCalled = 0;

    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        logLevel: 'silent',
      },
      onAfterCreateRsbuild: ({ rsbuild }) => {
        rsbuild.onAfterBuild(() => {
          afterBuildCalled++;
        });
      },
    });

    const result = await rslib.build();
    await result.close();

    expect(afterBuildCalled).toBe(1);
  });

  test('should allow to call `addPlugins` via Rsbuild instance', async () => {
    let afterBuildFromPluginCalled = 0;

    const afterBuildPlugin: RsbuildPlugin = {
      name: 'test-after-build-plugin',
      setup(api) {
        api.onAfterBuild(() => {
          afterBuildFromPluginCalled++;
        });
      },
    };

    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        logLevel: 'silent',
      },
      onAfterCreateRsbuild: ({ rsbuild }) => {
        rsbuild.addPlugins([afterBuildPlugin]);
      },
    });

    const result = await rslib.build();
    await result.close();

    expect(afterBuildFromPluginCalled).toBe(1);
  });

  test('should allow to call `modifyRsbuildConfig` via Rsbuild instance', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        logLevel: 'silent',
      },
      onAfterCreateRsbuild: ({ rsbuild }) => {
        rsbuild.modifyRsbuildConfig((config) => {
          config.mode = 'none';
        });
      },
    });

    const { origin } = await rslib.inspectConfig();
    expect(origin.rsbuildConfig.mode).toBe('none');
  });

  test('should allow to call `modifyEnvironmentConfig` via Rsbuild instance', async () => {
    const rslib = await createRslib({
      cwd: import.meta.dirname,
      config: {
        lib: [
          {
            format: 'esm',
          },
        ],
        logLevel: 'silent',
      },
      onAfterCreateRsbuild: ({ rsbuild }) => {
        rsbuild.modifyRsbuildConfig((config) => {
          config.mode = 'development';
        });
        rsbuild.modifyEnvironmentConfig((config) => {
          config.mode = 'none';
        });
      },
    });

    const { origin } = await rslib.inspectConfig();
    expect(origin.rsbuildConfig.mode).toBe('development');
    expect(origin.environmentConfigs.esm?.mode).toBe('none');
  });
});
