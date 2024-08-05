import type { RsbuildConfig } from '@rsbuild/core';
import type { EcmaScriptVersion, Syntax } from '../types/config';

/**
 * The esX to browserslist mapping is transformed from esbuild:
 * https://github.com/evanw/esbuild/blob/main/internal/compat/js_table.go
 * It does not completely align with the browserslist query of Rsbuild now:
 * https://github.com/rspack-contrib/browserslist-to-es-version
 * TODO: align with Rsbuild, we may should align with SWC
 */
const ESX_TO_BROWSERSLIST: Record<
  EcmaScriptVersion,
  Record<string, string | string[]>
> = {
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
  es2024: {},
  esnext: {},
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
};

export const transformSyntaxToBrowserslist = (
  syntax: Syntax,
): NonNullable<
  NonNullable<RsbuildConfig['output']>['overrideBrowserslist']
> => {
  // only single esX is allowed
  if (typeof syntax === 'string' && syntax.toLowerCase().startsWith('es')) {
    if (syntax.toLowerCase() in ESX_TO_BROWSERSLIST) {
      return Object.entries(ESX_TO_BROWSERSLIST[syntax]).flatMap(
        ([engine, version]) => {
          if (Array.isArray(version)) {
            return version;
          }

          return `${engine} >= ${version}`;
        },
      );
    }

    throw new Error(`Unsupported ES version: ${syntax}`);
  }

  // inline browserslist query
  if (Array.isArray(syntax)) {
    return syntax;
  }

  throw new Error(`Unsupported syntax: ${syntax}`);
};
