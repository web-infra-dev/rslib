import { parseOptions } from '@module-federation/enhanced';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

import { isRegExp, isRequiredVersion } from '../utils/index';

import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { RsbuildPlugin } from '@rsbuild/core';

type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

const PLUGIN_MODULE_FEDERATION_NAME = 'rsbuild:module-federation';
const pkgName = '@rsbuild/plugin-module-federation';
export const pluginModuleFederation = (
  moduleFederationOptions: ModuleFederationOptions,
): RsbuildPlugin => ({
  name: PLUGIN_MODULE_FEDERATION_NAME,
  setup: (api) => {
    const sharedOptions: [string, sharePlugin.SharedConfig][] = parseOptions(
      moduleFederationOptions.shared || [],
      (item, key) => {
        if (typeof item !== 'string')
          throw new Error('Unexpected array in shared');
        const config: sharePlugin.SharedConfig =
          item === key || !isRequiredVersion(item)
            ? {
                import: item,
              }
            : {
                import: key,
                requiredVersion: item,
              };
        return config;
      },
      (item) => item,
    );

    // shared[0] is the shared name
    const shared = sharedOptions.map((shared) =>
      shared[0].endsWith('/') ? shared[0].slice(0, -1) : shared[0],
    );
    api.modifyEnvironmentConfig((config, { name }) => {
      if (name !== 'mf') {
        return config;
      }

      const externals = config.output.externals;
      if (Array.isArray(externals)) {
        config.output.externals = externals.filter((ext) => {
          if (isRegExp(ext)) {
            return !shared.some(
              (dep) =>
                (ext as RegExp).test(dep) || (ext as RegExp).test(pkgName),
            );
          }

          if (typeof ext === 'string') {
            if (ext === pkgName) {
              return false;
            }
            return !shared.some((dep) => dep === ext);
          }
          return true;
        });
      }

      config.tools.rspack ??= [];
      if (Array.isArray(config.tools.rspack)) {
        config.tools.rspack.push({
          output: {
            chunkLoading: 'jsonp',
          },
          plugins: [new ModuleFederationPlugin(moduleFederationOptions)],
        });
      }
      return config;
    });
  },
});
