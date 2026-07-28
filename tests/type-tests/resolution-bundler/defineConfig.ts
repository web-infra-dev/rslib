import { defineConfig } from '@rslib/core';

defineConfig({
  lib: [{ syntax: 'es2017' }],
});

defineConfig(() => ({
  lib: [{ syntax: 'es2017' }],
}));

defineConfig(async () => ({
  lib: [{ syntax: 'es2017' }],
}));

// @ts-expect-error invalid syntax
defineConfig(async () => ({
  lib: [{ syntax: 'invalid' }],
}));
