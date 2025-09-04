import { beforeAll, describe, expect, test } from '@rstest/core';
import { buildAndGetResults } from 'test-helper';

enum BannerFooter {
  JS_BANNER = '/*! hello banner js */',
  JS_FOOTER = '/*! hello footer js */',
  CSS_BANNER = '/*! hello banner css */',
  CSS_FOOTER = '/*! hello footer css */',
  DTS_BANNER = '/*! hello banner dts */',
  DTS_FOOTER = '/*! hello footer dts */',
}

// There are 5 cases included in both tsc and tsgo
// 1. bundle esm
// 2. bundle cjs
// 3. bundleless esm
// 4. bundleless cjs
// 5. bundle esm with minify enabled
const checkBannerAndFooter = (
  contents: Record<string, string>[],
  type: 'js' | 'css' | 'dts',
) => {
  for (const content of Object.values(contents)) {
    if (content) {
      const expectedBanner =
        type === 'js'
          ? BannerFooter.JS_BANNER
          : type === 'css'
            ? BannerFooter.CSS_BANNER
            : BannerFooter.DTS_BANNER;
      const expectedFooter =
        type === 'js'
          ? BannerFooter.JS_FOOTER
          : type === 'css'
            ? BannerFooter.CSS_FOOTER
            : BannerFooter.DTS_FOOTER;

      for (const value of Object.values(content)) {
        expect(value).toContain(expectedBanner);
        expect(value).toContain(expectedFooter);
      }
    }
  }
};

describe('banner and footer should work in js, css and dts', () => {
  let jsContents: Record<string, string>[];
  let cssContents: Record<string, string>[];
  let dtsContents: Record<string, string>[];

  beforeAll(async () => {
    const fixturePath = __dirname;
    const { js, css, dts } = await buildAndGetResults({
      fixturePath,
      type: 'all',
    });
    jsContents = Object.values(js.contents);
    cssContents = Object.values(css.contents);
    dtsContents = Object.values(dts.contents);
  });

  test('tsc to generate declaration files', () => {
    checkBannerAndFooter(jsContents.slice(0, 5), 'js');
    checkBannerAndFooter(cssContents.slice(0, 5), 'css');
    checkBannerAndFooter(dtsContents.slice(0, 5), 'dts');
  });

  test.skipIf(process.version.startsWith('v18'))(
    'tsgo to generate declaration files',
    () => {
      checkBannerAndFooter(jsContents.slice(-5), 'js');
      checkBannerAndFooter(cssContents.slice(-5), 'css');
      checkBannerAndFooter(dtsContents.slice(-5), 'dts');
    },
  );
});
