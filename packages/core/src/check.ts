import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import type { TsconfigCompilerOptions } from './types';
import { color } from './utils/helper';
import { logger } from './utils/logger';

type PluginReactOptions = {
  tsconfigCompilerOptions?: TsconfigCompilerOptions;
};

const mapTsconfigJsxToSwcJsx = (jsx: string | undefined): string | null => {
  if (jsx === undefined) {
    // 'preserve' is the default value of tsconfig.compilerOptions.jsx
    return null;
  }

  // Calculate a corresponding SWC JSX config if tsconfig.compilerOptions.jsx is set to React related option.
  // Return `null` stands for no need to check.
  switch (jsx) {
    case 'react-jsx':
    case 'react-jsxdev':
      return 'automatic';
    case 'react':
      return 'classic';
    case 'preserve':
    case 'react-native':
      // SWC JSX does not support `preserve` as of now.
      return null;
    default:
      return null;
  }
};

const checkJsx = ({
  tsconfigCompilerOptions,
}: PluginReactOptions): RsbuildPlugin => ({
  name: 'rsbuild:lib-check',
  setup(api) {
    api.onBeforeEnvironmentCompile(({ environment }) => {
      const config = api.getNormalizedConfig({
        environment: environment.name,
      });
      const swc = config.tools.swc;
      const tsconfigJsx = tsconfigCompilerOptions?.jsx;
      if (swc && !Array.isArray(swc) && typeof swc !== 'function') {
        const swcReactRuntime = swc?.jsc?.transform?.react?.runtime || null;
        const mapped = mapTsconfigJsxToSwcJsx(tsconfigJsx);
        if (mapped !== swcReactRuntime) {
          logger.warn(
            `JSX runtime is set to ${color.green(`${JSON.stringify(swcReactRuntime)}`)} in SWC, but got ${color.green(`${JSON.stringify(tsconfigJsx)}`)} in tsconfig.json. This may cause unexpected behavior, considering aligning them.`,
          );
        }
      }
    });
  },
});

export const composeCheckConfig = (
  compilerOptions: TsconfigCompilerOptions,
): RsbuildConfig => {
  return { plugins: [checkJsx({ tsconfigCompilerOptions: compilerOptions })] };
};
