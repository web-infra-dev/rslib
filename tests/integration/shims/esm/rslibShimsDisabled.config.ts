import { defineConfig } from '@rslib/core';
import config from './rslib.config';

export default defineConfig({
  ...config,
  lib: [config.lib[0]!, config.lib[2]!].map((libConfig) => {
    if (typeof libConfig.output!.distPath === 'object') {
      libConfig.output!.distPath!.root =
        libConfig.output!.distPath!.root!.replace(
          './dist/enabled',
          './dist/disabled',
        );
    }
    delete libConfig.shims;
    return libConfig;
  }),
});
