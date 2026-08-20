import { beforeAll, describe, expect, test } from '@rstest/core';
import { join } from 'node:path';
import { buildAndGetResults, type BuildResult } from 'test-helper';

describe('Svelte', () => {
  let jsResult: BuildResult;
  let cssResult: BuildResult;

  beforeAll(async () => {
    const fixturePath = join(__dirname);
    const { js, css } = await buildAndGetResults({
      fixturePath,
      type: 'all',
    });
    jsResult = js;
    cssResult = css;
  });

  test('bundle', () => {
    expect(jsResult.contents.esm1).toMatchSnapshot();
    expect(cssResult.contents.esm1).toMatchSnapshot();
  });

  test('bundleless', () => {
    expect(jsResult.contents.esm0).toMatchSnapshot();
    expect(cssResult.contents.esm0).toMatchSnapshot();
  });
});
