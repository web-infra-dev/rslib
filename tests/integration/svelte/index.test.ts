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

  test('bundleless', () => {
    expect(jsResult.contents.esm).toMatchSnapshot();
    expect(cssResult.contents.esm).toMatchSnapshot();
  });
});
