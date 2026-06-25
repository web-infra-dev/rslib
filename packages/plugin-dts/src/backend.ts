import fs from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import type { PluginDtsOptions } from './index';

export type DtsGenerationBackend =
  | 'api-old'
  | 'tsc-bin'
  | 'tsgo-bin'
  | 'isolated';

type ParsedTypescriptVersion = {
  major: number;
  minor: number;
};

export const readTypescriptVersion = (cwd: string): string | undefined => {
  try {
    const currentRequire = createRequire(join(cwd, 'package.json'));
    const packageJsonPath = currentRequire.resolve('typescript/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return typeof packageJson.version === 'string'
      ? packageJson.version
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
  options: Pick<
    PluginDtsOptions,
    'isolated' | 'tsgo' | 'build' | 'abortOnError'
  >,
): void {
  if (options.isolated !== true) {
    return;
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
  options: Pick<
    PluginDtsOptions,
    'isolated' | 'tsgo' | 'build' | 'abortOnError'
  >,
  typescriptVersion?: string,
): DtsGenerationBackend {
  validateExplicitIsolatedDtsOptions(options);

  if (options.isolated === true) {
    return 'isolated';
  }

  if (isTypeScriptVersionAtLeast7(typescriptVersion)) {
    if (options.tsgo === false) {
      throw new Error(
        'Can not set "dts.tsgo: false" when using TypeScript 7 or higher.',
      );
    }

    return 'tsc-bin';
  }

  if (options.tsgo === true) {
    return 'tsgo-bin';
  }

  return 'api-old';
}
