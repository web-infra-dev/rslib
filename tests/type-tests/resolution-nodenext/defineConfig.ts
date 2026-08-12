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

// @ts-expect-error invalid syntax
defineConfig(async () => ({
  lib: [{ syntax: 'invalid' }],
}));

declare const dynamicDefinition: RslibConfigDefinition;
defineConfig(dynamicDefinition);
