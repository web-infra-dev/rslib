import type { PluginDtsOptions } from './index';

export type DtsGenerationBackend = 'isolated' | 'tsc' | 'tsgo';

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
): DtsGenerationBackend {
  validateExplicitIsolatedDtsOptions(options);

  // User-facing configuration always wins. We only sniff tsconfig for a default
  // backend when the user did not explicitly choose isolated / tsgo / build.
  if (options.isolated === true) {
    return 'isolated';
  }

  if (options.tsgo) {
    return 'tsgo';
  }

  if (options.build) {
    return 'tsc';
  }

  if (options.isolated === false) {
    return 'tsc';
  }

  return 'tsc';
}
