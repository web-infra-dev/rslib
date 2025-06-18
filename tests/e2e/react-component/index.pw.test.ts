import assert from 'node:assert';
import { expect, type Page, test } from '@playwright/test';
import { dev } from 'test-helper/rsbuild';

async function counterCompShouldWork(page: Page) {
  const h2El = page.locator('h2');
  await expect(h2El).toHaveText('Counter: 0');

  const buttonEl = page.locator('#root button');
  const [subtractEl, addEl] = await buttonEl.all();

  await expect(h2El).toHaveText('Counter: 0');
  addEl?.click();
  await expect(h2El).toHaveText('Counter: 1');
  subtractEl?.click();
  await expect(h2El).toHaveText('Counter: 0');
}

async function styleShouldWork(page: Page) {
  const h2El = page.locator('h2');
  expect(h2El).toHaveCSS('font-size', '50px');

  const buttonEl = page.locator('#root button');
  const [subtractEl, addEl] = await buttonEl.all();
  assert(subtractEl);
  assert(addEl);
  expect(subtractEl).toHaveCSS('background-color', 'rgb(255, 255, 0)');
  expect(addEl).toHaveCSS('background-color', 'rgb(255, 255, 0)');
}

async function assetShouldWork(page: Page) {
  // asset in css url('./logo.svg')
  const h1El = page.locator('h1');
  assert(h1El);
  expect(h1El).toHaveCSS('background', /static\/svg\/logo/);

  // asset by import url from './assets/logo.svg'
  const imgEls = await page.$$('.counter-button>img');
  expect(imgEls).toHaveLength(2);
  const srcList = await Promise.all(
    imgEls.map((imgEl) => imgEl.getAttribute('src')),
  );
  for (const src of srcList) {
    expect(src).toMatch(/static\/svg\/logo/);
  }
}

async function inlineAssetShouldWork(page: Page) {
  // asset in css url('./logo.svg')
  const h1El = page.locator('h1');
  assert(h1El);
  expect(h1El).toHaveCSS('background', /.*data:image\/svg\+xml;base64.*/);

  // asset by import url from './assets/logo.svg'
  const imgEls = await page.$$('.counter-button>img');
  expect(imgEls).toHaveLength(2);
  const srcList = await Promise.all(
    imgEls.map((imgEl) => imgEl.getAttribute('src')),
  );
  for (const src of srcList) {
    expect(src).toMatch(/.*data:image\/svg\+xml;base64.*/);
  }
}

test('should render example "react-component-bundle" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: __dirname,
    page,
    environment: ['bundle'],
  });

  await counterCompShouldWork(page);
  await styleShouldWork(page);
  await assetShouldWork(page);
  await rsbuild.close();
});

test('should render example "react-component-bundle-false" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: __dirname,
    page,
    environment: ['bundleFalse'],
  });

  await counterCompShouldWork(page);
  await styleShouldWork(page);
  await assetShouldWork(page);
  await rsbuild.close();
});

test('should render example "react-component-umd" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: __dirname,
    page,
    environment: ['umd'],
  });

  await counterCompShouldWork(page);
  await styleShouldWork(page);
  await inlineAssetShouldWork(page);
  await rsbuild.close();
});
