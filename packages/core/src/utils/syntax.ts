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
 * https://github.com/rstackjs/browserslist-to-es-version
 */
export const ESX_TO_BROWSERSLIST: Record<
  FixedEcmaVersions,
  Record<string, string>
> &
  Record<LatestEcmaVersions, (target: RsbuildConfigOutputTarget) => string[]> =
  {
    es5: {
      chrome: '13',
      edge: '12',
      firefox: '2',
      ios: '6',
      node: '0.6',
      safari: '5.1',
    },
    get es6() {
      return ESX_TO_BROWSERSLIST.es2015;
    },
    es2015: {
      chrome: '51',
      edge: '79',
      firefox: '53',
      ios: '16.3',
      node: '6.5',
      safari: '16.3',
    },
    es2016: {
      chrome: '52',
      edge: '79',
      firefox: '53',
      ios: '16.3',
      node: '7',
      safari: '16.3',
    },
    es2017: {
      chrome: '55',
      edge: '79',
      firefox: '53',
      ios: '16.3',
      node: '7.6',
      safari: '16.3',
    },
    es2018: {
      chrome: '64',
      edge: '79',
      firefox: '78',
      ios: '16.3',
      node: '10',
      safari: '16.3',
    },
    es2019: {
      chrome: '66',
      edge: '79',
      firefox: '78',
      ios: '16.3',
      node: '10',
      safari: '16.3',
    },
    es2020: {
      chrome: '91',
      edge: '91',
      firefox: '80',
      ios: '16.3',
      node: '16.9',
      safari: '16.3',
    },
    es2021: {
      chrome: '91',
      edge: '91',
      firefox: '80',
      ios: '16.3',
      node: '16.9',
      safari: '16.3',
    },
    es2022: {
      chrome: '94',
      edge: '94',
      firefox: '93',
      ios: '16.4',
      node: '16.11',
      safari: '16.4',
    },
    // ES2023 did not introduce new ECMA syntax, so map it to ES2022.
    get es2023() {
      return ESX_TO_BROWSERSLIST.es2022;
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
