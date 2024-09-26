import type { RsbuildConfig, Rspack } from '@rsbuild/core';
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
  if (!target) {
    return [...LATEST_TARGET_VERSIONS.node, ...LATEST_TARGET_VERSIONS.web];
  }

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
 * The esX to browserslist mapping is transformed from esbuild:
 * https://github.com/evanw/esbuild/blob/main/internal/compat/js_table.go
 * It does not completely align with the browserslist query of Rsbuild now:
 * https://github.com/rspack-contrib/browserslist-to-es-version
 * TODO: align with Rsbuild, we may should align with SWC
 */
export const ESX_TO_BROWSERSLIST: Record<
  FixedEcmaVersions,
  Record<string, string | string[]>
> &
  Record<LatestEcmaVersions, (target: RsbuildConfigOutputTarget) => string[]> =
  {
    es6: {
      Chrome: '63.0.0',
      Edge: '79.0.0',
      Firefox: '67.0.0',
      iOS: '13.0.0',
      Node: ['node > 12.20.0 and node < 13.0.0', 'node > 13.2.0'],
      Opera: '50.0.0',
      Safari: '13.0.0',
    },
    es2015: {
      Chrome: '63.0.0',
      Edge: '79.0.0',
      Firefox: '67.0.0',
      iOS: '13.0.0',
      Node: '10.0.0',
      Opera: '50.0.0',
      Safari: '13.0.0',
    },
    es2016: {
      Chrome: '52.0.0',
      Edge: '14.0.0',
      Firefox: '52.0.0',
      iOS: '10.3.0',
      Node: '7.0.0',
      Opera: '39.0.0',
      Safari: '10.1.0',
    },
    es2017: {
      Chrome: '55.0.0',
      Edge: '15.0.0',
      Firefox: '52.0.0',
      iOS: '11.0.0',
      Node: '7.6.0',
      Opera: '42.0.0',
      Safari: '11.0.0',
    },
    es2018: {
      Chrome: '64.0.0',
      Edge: '79.0.0',
      Firefox: '78.0.0',
      iOS: '16.4.0',
      Node: [
        'node > 18.20.0 and node < 19.0.0',
        'node > 20.12.0 and node < 21.0.0',
        'node > 21.3.0',
      ],
      Opera: '51.0.0',
      Safari: '16.4.0',
    },
    es2019: {
      Chrome: '66.0.0',
      Edge: '79.0.0',
      Firefox: '58.0.0',
      iOS: '11.3.0',
      Node: '10.0.0',
      Opera: '53.0.0',
      Safari: '11.1.0',
    },
    es2020: {
      Chrome: '91.0.0',
      Edge: '91.0.0',
      Firefox: '80.0.0',
      iOS: '14.5.0',
      Node: '16.1.0',
      Opera: '77.0.0',
      Safari: '14.1.0',
    },
    es2021: {
      Chrome: '85.0.0',
      Edge: '85.0.0',
      Firefox: '79.0.0',
      iOS: '14.0.0',
      Node: '15.0.0',
      Opera: '71.0.0',
      Safari: '14.0.0',
    },
    es2022: {
      Chrome: '91.0.0',
      Edge: '94.0.0',
      Firefox: '93.0.0',
      iOS: '16.4.0',
      Node: '16.11.0',
      Opera: '80.0.0',
      Safari: '16.4.0',
    },
    es2023: {
      Chrome: '74.0.0',
      Edge: '79.0.0',
      Firefox: '67.0.0',
      iOS: '13.4.0',
      Node: '12.5.0',
      Opera: '62.0.0',
      Safari: '13.1.0',
    },
    es2024: calcEsnextBrowserslistByTarget,
    esnext: calcEsnextBrowserslistByTarget,
    es5: {
      Chrome: '5.0.0',
      Edge: '12.0.0',
      Firefox: '2.0.0',
      ie: '9.0.0',
      iOS: '6.0.0',
      Node: '0.4.0',
      Opera: '10.10.0',
      Safari: '3.1.0',
    },
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
  target?: NonNullable<RsbuildConfig['output']>['target'],
): NonNullable<NonNullable<RsbuildConfig['output']>['overrideBrowserslist']> {
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
