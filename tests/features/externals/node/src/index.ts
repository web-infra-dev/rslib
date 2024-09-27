import fs from 'fs'; // handle bare node built-in modules
import assert from 'node:assert'; // handle node built-in modules with node: protocol
import React from 'react'; // works with the externals option in rslib.config.ts

export const foo = () => {
  assert(fs, 'fs exists');
  assert(React.version);
  const foo = require('foo'); // ESM: specified externals type
  const bar = require('bar'); // ESM: fallback to "module" when not specify externals type
  foo();
  bar();
};
