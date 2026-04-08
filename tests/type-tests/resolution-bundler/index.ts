// This folder disables `skipLibCheck` to check the public types of @rslib/core
import '@rslib/core/types';
import { createRslib, defineConfig } from '@rslib/core';

createRslib({});

defineConfig({ lib: [] });
