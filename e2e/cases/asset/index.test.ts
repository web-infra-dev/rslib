import { join } from 'node:path';
import { buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('set the size threshold to inline static assets', async () => {
  const fixturePath = join(__dirname, 'limit');
  const { contents } = await buildAndGetResults(fixturePath);

  // inline when bundle
  expect(Object.values(contents.esm0!)[0]).toContain(
    'const logo_namespaceObject = "data:image/svg+xml;base64',
  );

  // external when bundle
  expect(Object.values(contents.esm1!)[0]).toContain(
    'const logo_namespaceObject = __webpack_require__.p + "static/svg/logo.svg";',
  );

  // inline bundleless
  expect(Object.values(contents.esm2!)[0]).toContain(
    'const logo_namespaceObject = "data:image/svg+xml;base64',
  );

  // external bundleless
  expect(Object.values(contents.esm3!)[0]).toContain(
    'const logo_namespaceObject = __webpack_require__.p + "static/svg/logo.svg";',
  );
});

test('set the assets name', async () => {
  const fixturePath = join(__dirname, 'name');
  const { contents } = await buildAndGetResults(fixturePath);

  // bundle
  expect(Object.values(contents.esm0!)[0]).toContain(
    'const image_namespaceObject = __webpack_require__.p + "static/image/image.c74653c1.png";',
  );

  // bundleless
  expect(Object.values(contents.esm1!)[0]).toContain(
    'const image_namespaceObject = __webpack_require__.p + "static/image/image.c74653c1712618b1.png";',
  );
});

test('set the assets output path', async () => {
  const fixturePath = join(__dirname, 'path');
  const { contents } = await buildAndGetResults(fixturePath);

  // bundle
  expect(Object.values(contents.esm0!)[0]).toContain(
    'const image_namespaceObject = __webpack_require__.p + "assets/bundle/image.png";',
  );

  // bundleless
  expect(Object.values(contents.esm1!)[0]).toContain(
    'const image_namespaceObject = __webpack_require__.p + "assets/bundleless/image.png";',
  );
});

test('set the assets public path', async () => {
  const fixturePath = join(__dirname, 'public-path');
  const { contents } = await buildAndGetResults(fixturePath);

  // bundle
  expect(Object.values(contents.esm0!)[0]).toContain(
    '__webpack_require__.p = "/public/path/bundle/";',
  );

  // bundleless
  expect(Object.values(contents.esm1!)[0]).toContain(
    '__webpack_require__.p = "/public/path/bundleless/";',
  );
});

test('use svgr', async () => {
  const fixturePath = join(__dirname, 'svgr');
  const { contents } = await buildAndGetResults(fixturePath);

  // bundle -- default export with react query
  expect(Object.values(contents.esm0!)[0]).toMatchSnapshot();

  // bundleless -- default export with react query
  expect(Object.values(contents.esm1!)[0]).toMatchSnapshot();

  // bundle -- named export
  expect(Object.values(contents.esm2!)[0]).toMatchSnapshot();

  // bundleless -- named export
  expect(Object.values(contents.esm3!)[0]).toMatchSnapshot();
});
