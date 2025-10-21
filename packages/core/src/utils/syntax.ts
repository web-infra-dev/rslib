import type { EnvironmentConfig, Rspack } from '@rsbuild/core';
import type {
  EcmaScriptVersion,
  FixedEcmaVersions,
  LatestEcmaVersions,
  RsbuildConfigOutputTarget,
  Syntax,
} from '../types/config';

export const LATEST_TARGET_VERSIONS: Record<
  NonNullable<RsbuildConfigOutputTarget>,
  string[]
> = {
  node: ['last 1 node versions'],
  web: [
    'last 1 Chrome versions',
    'last 1 Firefox versions',
    'last 1 Edge versions',
    'last 1 Safari versions',
    'last 1 ios_saf versions',
    'not dead',
  ],
  get 'web-worker'() {
    return LATEST_TARGET_VERSIONS.web;
  },
};

const calcEsnextBrowserslistByTarget = (target: RsbuildConfigOutputTarget) => {
  if (target === 'node') {
    return LATEST_TARGET_VERSIONS.node;
  }

  return LATEST_TARGET_VERSIONS.web;
};

const RSPACK_TARGET_UNLISTED_MODERN_ECMA_VERSIONS: EcmaScriptVersion[] = [
  'es2023',
  'es2024',
  'esnext',
] satisfies EcmaScriptVersion[];

/**
 * The esX to browserslist mapping is transformed from
 * https://github.com/rspack-contrib/browserslist-to-es-version
 */
export const ESX_TO_BROWSERSLIST: Record<
  FixedEcmaVersions,
  Record<string, string>
> &
  Record<LatestEcmaVersions, (target: RsbuildConfigOutputTarget) => string[]> =
  {
    es5: {
      chrome: '5.0.0',
      edge: '12.0.0',
      firefox: '2.0.0',
      ie: '9.0.0',
      ios: '6.0.0',
      node: '0.4.0',
      opera: '10.10.0',
      safari: '3.1.0',
    },
    es6: {
      chrome: '51.0.0',
      edge: '15.0.0',
      firefox: '54.0.0',
      safari: '10.0.0',
      opera: '38.0.0',
      samsung: '5.0.0',
    },
    es2015: {
      chrome: '51.0.0',
      edge: '15.0.0',
      firefox: '54.0.0',
      safari: '10.0.0',
      opera: '38.0.0',
      samsung: '5.0.0',
    },
    es2016: {
      chrome: '52.0.0',
      edge: '15.0.0',
      firefox: '54.0.0',
      safari: '10.3.0',
      opera: '39.0.0',
      samsung: '6.2.0',
    },
    es2017: {
      chrome: '57.0.0',
      edge: '15.0.0',
      firefox: '54.0.0',
      safari: '11.0.0',
      opera: '44.0.0',
      samsung: '6.2.0',
    },
    es2018: {
      chrome: '64.0.0',
      edge: '79.0.0',
      firefox: '78.0.0',
      safari: '16.4.0',
      opera: '51.0.0',
      samsung: '8.2.0',
    },
    es2019: {
      chrome: '73.0.0',
      edge: '79.0.0',
      firefox: '78.0.0',
      safari: '17.0.0',
      opera: '60.0.0',
      samsung: '11.1.0',
    },
    es2020: {
      chrome: '80.0.0',
      edge: '80.0.0',
      firefox: '80.0.0',
      safari: '17.0.0',
      opera: '67.0.0',
      samsung: '13.0.0',
    },
    es2021: {
      chrome: '85.0.0',
      edge: '85.0.0',
      firefox: '80.0.0',
      safari: '17.0.0',
      opera: '71.0.0',
      samsung: '14.0.0',
    },
    es2022: {
      chrome: '94.0.0',
      edge: '94.0.0',
      firefox: '93.0.0',
      safari: '17.0.0',
      opera: '80.0.0',
      samsung: '17.0.0',
    },
    es2023: {
      chrome: '110.0.0',
      edge: '110.0.0',
      firefox: '115.0.0',
      safari: '17.0.0',
      opera: '96.0.0',
      samsung: '21.0.0',
    },
    es2024: calcEsnextBrowserslistByTarget,
    esnext: calcEsnextBrowserslistByTarget,
  } as const;

export function transformSyntaxToRspackTarget(
  syntax: Syntax,
): Rspack.Configuration['target'] {
  const handleSyntaxItem = (syntaxItem: EcmaScriptVersion | string): string => {
    const normalizedSyntaxItem = syntaxItem.toLowerCase();

    if (normalizedSyntaxItem.startsWith('es')) {
      if (normalizedSyntaxItem in ESX_TO_BROWSERSLIST) {
        // The latest EcmaScript version supported by Rspack's `target` is es2022.
        // Higher versions are treated as es2022.
        if (
          RSPACK_TARGET_UNLISTED_MODERN_ECMA_VERSIONS.includes(
            normalizedSyntaxItem as EcmaScriptVersion,
          )
        ) {
          return 'es2022';
        }
        // The es6 is the same as es2015, compatible with rspack API schema
        if (normalizedSyntaxItem === 'es6') {
          return 'es2015';
        }
        return normalizedSyntaxItem;
      }

      throw new Error(`Unsupported ES version: ${syntaxItem}`);
    }

    return `browserslist:${syntaxItem}`;
  };

  if (Array.isArray(syntax)) {
    return syntax.map(handleSyntaxItem) as Rspack.Configuration['target'];
  }

  return [handleSyntaxItem(syntax)] as Rspack.Configuration['target'];
}

export function transformSyntaxToBrowserslist(
  syntax: Syntax,
  target: NonNullable<EnvironmentConfig['output']>['target'],
): NonNullable<
  NonNullable<EnvironmentConfig['output']>['overrideBrowserslist']
> {
  const handleSyntaxItem = (
    syntaxItem: EcmaScriptVersion | string,
  ): string[] => {
    const normalizedSyntaxItem = syntaxItem.toLowerCase();

    if (normalizedSyntaxItem.startsWith('es')) {
      if (normalizedSyntaxItem in ESX_TO_BROWSERSLIST) {
        const browserslistItem =
          ESX_TO_BROWSERSLIST[normalizedSyntaxItem as EcmaScriptVersion];
        if (typeof browserslistItem === 'function') {
          return browserslistItem(target);
        }

        return Object.entries(browserslistItem).flatMap(([engine, version]) => {
          if (Array.isArray(version)) {
            return version;
          }

          return `${engine} >= ${version}`;
        });
      }

      throw new Error(`Unsupported ES version: ${syntaxItem}`);
    }

    return [syntaxItem];
  };

  if (Array.isArray(syntax)) {
    return syntax.flatMap(handleSyntaxItem);
  }

  return handleSyntaxItem(syntax);
}
