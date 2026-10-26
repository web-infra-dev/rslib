#!/usr/bin/env node
'use client';

import path from 'path';
import { bar } from './bar';
import { foo } from './foo';

console.log(
  'Hello, world!' + foo + bar + path.resolve('fs') + __dirname + __filename,
);
console.log(import.meta.url);
