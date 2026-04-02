import path from 'node:path';
import type { EnvironmentConfig } from '@rsbuild/core';
import type { ExeOptions, Format } from '../types';
import { ExePlugin } from './plugin';
import type {
  ComposeExeConfigOptions,
  ComposedExeConfig,
  ExeTargetInput,
  NormalizedExeTarget,
} from './types';
import {
  assertSupportedExeRuntime,
  getCurrentExeArch,
  getCurrentExePlatform,
  normalizeNodeVersion,
} from './version';

const normalizeTargetsInput = (exe?: ExeOptions): ExeTargetInput[] => {
  if (!exe) {
    return [];
  }

  if (exe === true) {
    return [{}];
  }

  return exe.targets && exe.targets.length > 0 ? exe.targets : [{}];
};

export const resolveExeTargets = (
  exe?: ExeOptions,
  root: string = process.cwd(),
): NormalizedExeTarget[] => {
  const currentPlatform = getCurrentExePlatform();
  const currentArch = getCurrentExeArch();
  const currentNodeVersion = normalizeNodeVersion(process.versions.node);
  const targets = normalizeTargetsInput(exe);
  const sharedOptions =
    exe && exe !== true
      ? {
          fileName: exe.fileName,
          outputPath: exe.outputPath
            ? path.resolve(root, exe.outputPath)
            : undefined,
          seaOptions: exe.seaOptions ?? {},
        }
      : {
          fileName: undefined,
          outputPath: undefined,
          seaOptions: {},
        };

  const normalizedTargets = targets.map((target, index) => {
    const targetConfig = typeof target === 'string' ? {} : target;
    // String targets are a shorthand for "use this exact Node binary as the
    // executable template", while object targets describe a platform/arch pair
    // that Rslib can resolve on its own.
    const resolvedCustomBinaryPath =
      typeof target === 'string' ? path.resolve(root, target) : undefined;
    const platform = targetConfig.platform ?? currentPlatform;
    const arch = targetConfig.arch ?? currentArch;
    const nodeVersion = normalizeNodeVersion(
      targetConfig.nodeVersion ?? currentNodeVersion,
    );
    const isCrossPlatform =
      platform !== currentPlatform || arch !== currentArch;

    const normalizedTarget: NormalizedExeTarget = {
      arch,
      fileName: sharedOptions.fileName,
      index,
      nodeVersion,
      outputPath: sharedOptions.outputPath,
      platform,
      customBinaryPath: resolvedCustomBinaryPath,
      seaOptions: isCrossPlatform
        ? {
            // Node SEA snapshots/code cache are tied to the host runtime, so
            // cross-platform targets must fall back to the portable defaults.
            ...sharedOptions.seaOptions,
            useCodeCache: false,
            useSnapshot: false,
          }
        : sharedOptions.seaOptions,
      suffix: null,
    };

    return normalizedTarget;
  });

  if (normalizedTargets.length <= 1) {
    return normalizedTargets;
  }

  return normalizedTargets.map((target) => ({
    ...target,
    suffix: `${target.platform}-${target.arch}-${target.nodeVersion}`,
  }));
};

const validateExeTargets = ({
  bundle,
  targets,
  format,
  sourceEntry,
  target,
}: {
  bundle: boolean;
  targets: NormalizedExeTarget[];
  format: Format;
  sourceEntry?: ComposeExeConfigOptions['sourceEntry'];
  target: ComposeExeConfigOptions['target'];
}): void => {
  if (targets.length === 0) {
    return;
  }

  if (format !== 'esm' && format !== 'cjs') {
    throw new Error(
      `"experiments.exe" only supports "esm" and "cjs" formats, but received ${JSON.stringify(format)}.`,
    );
  }

  if (!bundle) {
    throw new Error(`"experiments.exe" requires "bundle" to be "true".`);
  }

  if (target !== 'node') {
    throw new Error(
      `"experiments.exe" only supports "output.target = \\"node\\"", but received ${JSON.stringify(target)}.`,
    );
  }

  if (sourceEntry && Object.keys(sourceEntry).length > 1) {
    throw new Error(
      `"experiments.exe" currently supports a single entry per library, but received ${Object.keys(sourceEntry).length} entries.`,
    );
  }

  assertSupportedExeRuntime();

  for (const targetItem of targets) {
    if (format === 'esm' && targetItem.seaOptions.useSnapshot) {
      throw new Error(
        `"experiments.exe.seaOptions.useSnapshot" cannot be used together with "esm" executables.`,
      );
    }
  }
};

export const composeExeConfig = ({
  bundle,
  exe,
  format,
  root,
  sourceEntry,
  target,
}: ComposeExeConfigOptions): ComposedExeConfig => {
  const normalizedTargets = resolveExeTargets(exe, root);

  if (normalizedTargets.length === 0) {
    return {
      config: {},
    };
  }

  validateExeTargets({
    bundle,
    targets: normalizedTargets,
    format,
    sourceEntry,
    target,
  });
  const exeFormat: Extract<Format, 'esm' | 'cjs'> =
    format === 'esm' ? 'esm' : 'cjs';
  const config: EnvironmentConfig = {
    plugins: [
      ExePlugin({
        targets: normalizedTargets,
        format: exeFormat,
        root,
      }),
    ],
    tools: {
      rspack: {
        optimization: {
          runtimeChunk: false,
          splitChunks: false,
        },
        output: {
          asyncChunks: false,
        },
      },
    },
  };

  return {
    config,
  };
};
