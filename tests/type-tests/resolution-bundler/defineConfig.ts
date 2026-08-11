import {
  defineConfig,
  type RslibConfig,
  type RslibConfigAsyncFn,
  type RslibConfigDefinition,
  type RslibConfigSyncFn,
} from '@rslib/core';

export const objectConfig: RslibConfig = defineConfig({
  lib: [{ syntax: 'es2017' }],
});

export const syncConfig: RslibConfigSyncFn = defineConfig(() => ({
  lib: [{ syntax: 'es2017' }],
}));

export const asyncConfig: RslibConfigAsyncFn = defineConfig(async () => ({
  lib: [{ syntax: 'es2017' }],
}));

// @ts-expect-error invalid syntax
defineConfig(async () => ({
  lib: [{ syntax: 'invalid' }],
}));

declare const dynamicDefinition: RslibConfigDefinition;
defineConfig(dynamicDefinition);
