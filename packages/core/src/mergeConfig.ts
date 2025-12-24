import { mergeRsbuildConfig } from '@rsbuild/core';
import type { RslibConfig } from './types';

export type RslibConfigWithOptionalLib = Omit<RslibConfig, 'lib'> & {
  lib?: RslibConfig['lib'];
};

export const mergeRslibConfig: (
  ...originalConfigs: (RslibConfigWithOptionalLib | undefined)[]
) => RslibConfigWithOptionalLib =
  mergeRsbuildConfig<RslibConfigWithOptionalLib>;
