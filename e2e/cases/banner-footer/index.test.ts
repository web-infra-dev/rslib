import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

enum BannerFooter {
  JS_BANNER = '/*! hello banner js */',
  JS_FOOTER = '/*! hello footer js */',
  CSS_BANNER = '/*! hello banner css */',
  CSS_FOOTER = '/*! hello footer css */',
  DTS_BANNER = '/*! hello banner dts */',
  DTS_FOOTER = '/*! hello footer dts */',
}

test('banner and footer should work in js, css and dts', async () => {
  const fixturePath = __dirname;
  const { js, css, dts } = await buildAndGetResults(fixturePath, 'all');

  const jsContents = Object.values(js.contents);
  const cssContents = Object.values(css.contents);
  const dtsContents = Object.values(dts.contents);

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

  checkBannerAndFooter(jsContents, 'js');
  checkBannerAndFooter(cssContents, 'css');
  checkBannerAndFooter(dtsContents, 'dts');
});
