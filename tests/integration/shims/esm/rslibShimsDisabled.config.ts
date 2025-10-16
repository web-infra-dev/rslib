import { defineConfig } from '@rslib/core';
import config from './rslib.config';

export default defineConfig({
  ...config,
  lib: [config.lib[0]!, config.lib[2]!].map((libConfig) => {
    if (typeof libConfig.output!.distPath === 'string') {
      libConfig.output!.distPath = libConfig.output!.distPath.replace(
        './dist/enabled',
        './dist/disabled',
      );
    }
    delete libConfig.shims;
    return libConfig;
  }),
});
