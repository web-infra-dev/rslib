import type { PluginDtsOptions } from './index';

export type DtsGenerationBackend = 'tsc-api' | 'tsgo-bin' | 'isolated';

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

  if (options.isolated === true) {
    return 'isolated';
  }

  if (options.tsgo) {
    return 'tsgo-bin';
  }

  return 'tsc-api';
}
