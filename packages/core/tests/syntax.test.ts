import { describe, expect, test } from '@rstest/core';
import type { EcmaScriptVersion } from '../src/types';
import {
  ESX_TO_BROWSERSLIST,
  transformSyntaxToBrowserslist,
  transformSyntaxToRspackTarget,
} from '../src/utils/syntax';

const compareSemver = (a: string, b: string) => {
  const [aMajor, aMinor, aPatch] = a.split('.').map(Number) as [
    number,
    number,
    number,
  ];
  const [bMajor, bMinor, bPatch] = b.split('.').map(Number) as [
    number,
    number,
    number,
  ];

  if (aMajor !== bMajor) {
    return aMajor - bMajor;
  }
  if (aMinor !== bMinor) {
    return aMinor - bMinor;
  }
  return aPatch - bPatch;
};

describe('ESX_TO_BROWSERSLIST', () => {
  test('some ECMA version queries should be the same', () => {
    expect(ESX_TO_BROWSERSLIST.es6).toStrictEqual(ESX_TO_BROWSERSLIST.es2015);
    expect(ESX_TO_BROWSERSLIST.esnext).toStrictEqual(
      ESX_TO_BROWSERSLIST.es2024,
    );
  });

  test('ECMA version mapped browserslist queries should increments', () => {
    const sortedVersions: EcmaScriptVersion[] = [
      'es5',
      'es6',
      'es2015',
      'es2016',
      'es2017',
      'es2018',
      'es2019',
      'es2020',
      'es2021',
      'es2022',
      'es2023',
    ];

    for (let i = 1; i < sortedVersions.length; i++) {
      const prev = sortedVersions[i - 1]!;
      const current = sortedVersions[i]!;
      for (const query of Object.keys(ESX_TO_BROWSERSLIST[current])) {
        const prevQuery = (ESX_TO_BROWSERSLIST[prev] as Record<string, string>)[
          query
        ];
        const currQuery = (
          ESX_TO_BROWSERSLIST[current] as Record<string, string>
        )[query];
        if (prevQuery && currQuery) {
          expect(compareSemver(currQuery, prevQuery)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe('transformSyntaxToBrowserslist', () => {
  test('esX', () => {
    expect(
      transformSyntaxToBrowserslist('es2015', 'web'),
    ).toMatchInlineSnapshot(`
      [
        "chrome >= 63.0.0",
        "edge >= 79.0.0",
        "firefox >= 67.0.0",
        "ios >= 13.0.0",
        "node >= 13.2.0",
        "opera >= 50.0.0",
        "safari >= 13.0.0",
      ]
    `);

    expect(
      transformSyntaxToBrowserslist('es2018', 'web'),
    ).toMatchInlineSnapshot(`
      [
        "chrome >= 64.0.0",
        "edge >= 79.0.0",
        "firefox >= 78.0.0",
        "ios >= 16.4.0",
        "node >= 13.2.0",
        "opera >= 51.0.0",
        "safari >= 16.4.0",
      ]
    `);

    const web = transformSyntaxToBrowserslist('esnext', 'web');
    const webWorker = transformSyntaxToBrowserslist('esnext', 'web-worker');
    expect(web).toStrictEqual(webWorker);
    expect(web).toMatchInlineSnapshot(`
      [
        "last 1 Chrome versions",
        "last 1 Firefox versions",
        "last 1 Edge versions",
        "last 1 Safari versions",
        "last 1 ios_saf versions",
        "not dead",
      ]
    `);

    expect(
      transformSyntaxToBrowserslist('esnext', 'node'),
    ).toMatchInlineSnapshot(`
      [
        "last 1 node versions",
      ]
    `);
    expect(transformSyntaxToBrowserslist('esnext', 'node')).toStrictEqual(
      transformSyntaxToBrowserslist('es2024', 'node'),
    );
  });

  test('browserslist', () => {
    expect(
      transformSyntaxToBrowserslist(['fully supports es6-module'], 'web'),
    ).toMatchInlineSnapshot(`
        [
          "fully supports es6-module",
        ]
      `);

    expect(
      transformSyntaxToBrowserslist(['node 14', 'Chrome 103'], 'web'),
    ).toMatchInlineSnapshot(`
      [
        "node 14",
        "Chrome 103",
      ]
    `);
  });

  test('combined', () => {
    expect(
      transformSyntaxToBrowserslist(['Chrome 123', 'es5'], 'web'),
    ).toMatchInlineSnapshot(`
      [
        "Chrome 123",
        "chrome >= 5.0.0",
        "edge >= 12.0.0",
        "firefox >= 2.0.0",
        "ie >= 9.0.0",
        "ios >= 6.0.0",
        "node >= 0.4.0",
        "opera >= 10.10.0",
        "safari >= 3.1.0",
      ]
    `);

    expect(transformSyntaxToBrowserslist(['es5'], 'web')).toEqual(
      transformSyntaxToBrowserslist('es5', 'web'),
    );
  });
});

describe('transformSyntaxToRspackTarget', () => {
  test('esX', () => {
    const es6 = transformSyntaxToRspackTarget('es6');
    const es2023 = transformSyntaxToRspackTarget('es2023');
    const es2024 = transformSyntaxToRspackTarget('es2024');
    const esnext = transformSyntaxToRspackTarget('esnext');

    expect(es2023).toEqual(es2024);
    expect(es2023).toEqual(esnext);

    expect(es6).toMatchInlineSnapshot(`
      [
        "es2015",
      ]
    `);

    expect(es2023).toMatchInlineSnapshot(
      `
      [
        "es2022",
      ]
    `,
    );

    expect(transformSyntaxToRspackTarget('es2015')).toMatchInlineSnapshot(
      `
      [
        "es2015",
      ]
    `,
    );
  });

  test('combined', () => {
    expect(
      transformSyntaxToRspackTarget(['Chrome 123', 'es2023']),
    ).toMatchInlineSnapshot(`
      [
        "browserslist:Chrome 123",
        "es2022",
      ]
    `);

    expect(
      transformSyntaxToRspackTarget(['Chrome 123', 'es6']),
    ).toMatchInlineSnapshot(`
      [
        "browserslist:Chrome 123",
        "es2015",
      ]
    `);
  });
});
