import { type Page, expect, test } from '@playwright/test';
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
  subtractEl &&
    expect(subtractEl).toHaveCSS('background-color', 'rgb(255, 255, 0)');
  addEl && expect(addEl).toHaveCSS('background-color', 'rgb(255, 255, 0)');
}

test('should render example "react-component-bundle" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: __dirname,
    page,
    rsbuildConfig: {
      source: {
        entry: {
          index: './src/bundle.tsx',
        },
      },
    },
  });

  await counterCompShouldWork(page);

  await styleShouldWork(page);

  await rsbuild.close();
});

test('should render example "react-component-bundle-false" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: __dirname,
    page,
    rsbuildConfig: {
      source: {
        entry: {
          index: './src/bundleFalse.tsx',
        },
      },
    },
  });

  await counterCompShouldWork(page);

  await styleShouldWork(page);

  await rsbuild.close();
});
