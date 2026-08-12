import {
  type ConfigParams,
  defineConfig,
  type RslibConfig,
  type RslibConfigAsyncFn,
  type RslibConfigDefinition,
  type RslibConfigSyncFn,
} from '@rslib/core';

export const objectConfig: RslibConfig = defineConfig({
  lib: [{ syntax: 'es2017' }],
});

defineConfig({
  lib: [
    {
      syntax: 'es2017',
      // @ts-expect-error unknown config key
      typo: true,
    },
  ],
});

export const syncConfig: RslibConfigSyncFn = defineConfig((env) => {
  void (env satisfies ConfigParams);
  // @ts-expect-error ConfigParams does not include unknown properties
  void env.unknown;

  return {
    lib: [{ syntax: 'es2017' }],
  };
});

declare const configParams: ConfigParams;
void defineConfig(() => ({ lib: [] }))(configParams).output;

export const asyncConfig: RslibConfigAsyncFn = defineConfig(async () => ({
  lib: [{ syntax: 'es2017' }],
}));

export const explicitConfig: RslibConfigSyncFn = defineConfig<RslibConfig>(
  () => ({
    lib: [],
  }),
);

export const anyConfig: RslibConfigSyncFn = defineConfig(() =>
  JSON.parse('{}'),
);

export function forwardSyncConfig<Config extends RslibConfig>(
  config: (env: ConfigParams) => Config,
): RslibConfigSyncFn {
  return defineConfig(config);
}

export function forwardAsyncConfig<Config extends RslibConfig>(
  config: (env: ConfigParams) => Promise<Config>,
): RslibConfigAsyncFn {
  return defineConfig(config);
}

// @ts-expect-error invalid syntax
defineConfig({ lib: [{ syntax: 'invalid' }] });

// @ts-expect-error invalid syntax
defineConfig(async () => ({
  lib: [{ syntax: 'invalid' }],
}));

declare const dynamicDefinition: RslibConfigDefinition;
defineConfig(dynamicDefinition);
