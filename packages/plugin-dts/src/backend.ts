import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { DtsGenerationBackend } from './types/internal';
import type { PluginDtsOptions } from './types/options';
import { createRequireFromPackageJson } from './utils';

const require = createRequire(import.meta.url);

type ParsedTypescriptVersion = {
  major: number;
  minor: number;
};

export const resolveTypescriptPath = (
  cwd: string,
  configuredPath?: string,
): string | undefined => {
  if (configuredPath !== undefined) {
    if (!path.isAbsolute(configuredPath)) {
      throw new Error(
        `The "dts.typescriptPath" option must be an absolute path to a TypeScript module entry, received ${JSON.stringify(configuredPath)}.`,
      );
    }

    if (!fs.existsSync(configuredPath)) {
      throw new Error(
        `Failed to resolve TypeScript from "dts.typescriptPath": ${JSON.stringify(configuredPath)} does not exist.`,
      );
    }

    return configuredPath;
  }

  try {
    const currentRequire = createRequireFromPackageJson(cwd);
    return currentRequire.resolve('typescript');
  } catch {
    return undefined;
  }
};

export const readTypescriptVersion = (
  typescriptPath: string | undefined,
): string | undefined => {
  if (!typescriptPath) {
    return undefined;
  }

  try {
    const typescript = require(typescriptPath) as {
      version?: unknown;
    };
    return typeof typescript.version === 'string'
      ? typescript.version
      : undefined;
  } catch {
    return undefined;
  }
};

const parseTypescriptVersion = (
  version: string | undefined,
): ParsedTypescriptVersion | undefined => {
  const match = version?.match(/^(\d+)\.(\d+)/);

  if (!match) {
    return undefined;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
  };
};

const isTypeScriptVersionAtLeast7 = (version: string | undefined): boolean => {
  const parsedVersion = parseTypescriptVersion(version);

  if (!parsedVersion) {
    return false;
  }

  return parsedVersion.major >= 7;
};

export function validateExplicitIsolatedDtsOptions(
  options: PluginDtsOptions,
): void {
  if (options.isolated !== true) {
    return;
  }

  if (options.typescriptPath !== undefined) {
    throw new Error(
      'Can not set "dts.typescriptPath" when "dts.isolated: true".',
    );
  }

  if (options.tsgo) {
    throw new Error('Can not set "dts.isolated: true" when "dts.tsgo: true".');
  }

  if (options.build) {
    throw new Error('Can not set "dts.isolated: true" when "dts.build: true".');
  }

  if (options.abortOnError === false) {
    throw new Error(
      'Can not set "dts.abortOnError: false" when "dts.isolated: true".',
    );
  }
}

export function resolveDtsGenerationBackend(
  options: PluginDtsOptions,
  typescriptVersion?: string,
): DtsGenerationBackend {
  validateExplicitIsolatedDtsOptions(options);

  if (options.isolated === true) {
    return 'isolated';
  }

  if (isTypeScriptVersionAtLeast7(typescriptVersion)) {
    if (options.tsgo === false) {
      throw new Error(
        'Can not set "dts.tsgo: false" when using `typescript` >= 7.0.0.',
      );
    }

    return 'ts7-executable';
  }

  if (options.tsgo === true) {
    throw new Error('`dts.tsgo` requires `typescript` >= 7.0.0.');
  }

  return 'api-old';
}
