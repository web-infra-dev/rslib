import { describe, expect, test } from 'vitest';
import { transformSyntaxToBrowserslist } from '../src/utils/syntax';

describe('Correctly resolve syntax', () => {
  test('esX', async () => {
    expect(transformSyntaxToBrowserslist('es6')).toMatchInlineSnapshot(`
      [
        "Chrome >= 63.0.0",
        "Edge >= 79.0.0",
        "Firefox >= 67.0.0",
        "iOS >= 13.0.0",
        "node > 12.20.0 and node < 13.0.0",
        "node > 13.2.0",
        "Opera >= 50.0.0",
        "Safari >= 13.0.0",
      ]
    `);

    expect(transformSyntaxToBrowserslist('es2018')).toMatchInlineSnapshot(`
      [
        "Chrome >= 64.0.0",
        "Edge >= 79.0.0",
        "Firefox >= 78.0.0",
        "iOS >= 16.4.0",
        "node > 18.20.0 and node < 19.0.0",
        "node > 20.12.0 and node < 21.0.0",
        "node > 21.3.0",
        "Opera >= 51.0.0",
        "Safari >= 16.4.0",
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

  test('browserslist', async () => {
    expect(
      transformSyntaxToBrowserslist(['fully supports es6-module']),
    ).toMatchInlineSnapshot(`
        [
          "fully supports es6-module",
        ]
      `);

    expect(
      transformSyntaxToBrowserslist(['node 14', 'Chrome 103']),
    ).toMatchInlineSnapshot(`
      [
        "node 14",
        "Chrome 103",
      ]
    `);
  });

  test('combined', async () => {
    expect(
      transformSyntaxToBrowserslist(['Chrome 123', 'es5']),
    ).toMatchInlineSnapshot(`
      [
        "Chrome 123",
        "Chrome >= 5.0.0",
        "Edge >= 12.0.0",
        "Firefox >= 2.0.0",
        "ie >= 9.0.0",
        "iOS >= 6.0.0",
        "Node >= 0.4.0",
        "Opera >= 10.10.0",
        "Safari >= 3.1.0",
      ]
    `);

    expect(transformSyntaxToBrowserslist(['es5'])).toEqual(
      transformSyntaxToBrowserslist('es5'),
    );
  });
});
