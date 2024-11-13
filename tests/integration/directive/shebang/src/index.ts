#!/usr/bin/env node

import path from 'path';
import { bar } from './bar';
import { foo } from './foo';

console.log(
  'Hello, world!' + foo + bar + path.resolve('fs') + __dirname + __filename,
);
