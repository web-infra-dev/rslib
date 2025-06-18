import assert from 'node:assert'; // handle node built-in modules with node: protocol
import fs from 'fs'; // handle bare node built-in modules
import React from 'react'; // works with the externals option in rslib.config.ts

export const foo = async () => {
  assert(fs, 'fs exists');
  const fooModule = require('foo'); // ESM: specified externals type
  fooModule();
};

export const bar = async () => {
  assert(React.version);
  const barModule = require('bar'); // ESM: fallback to "module" when not specify externals type
  barModule();
};

export const baz = async () => {
  // @ts-ignore
  const bazModule = await import('./baz.mjs'); // should be kept dynamic import by default
  return bazModule.baz;
};
