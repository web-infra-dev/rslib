import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { withDefaultConfig } from '@lynx-js/react/testing-library/rstest-config';
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: [withDefaultConfig(), withRslibConfig()],
  plugins: [pluginReactLynx()],
});
