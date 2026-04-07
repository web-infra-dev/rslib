import { expect, type Page, test } from '@playwright/test';
import { dev } from 'test-helper/rsbuild';

async function counterCompShouldWork(page: Page) {
  const h2El = page.locator('h2');
  await expect(h2El).toHaveText('Counter: 0');

  const buttonEl = page.locator('#root button');
  await expect(buttonEl).toHaveCount(2);

  const [subtractEl, addEl] = await buttonEl.all();

  await addEl!.click();
  await expect(h2El).toHaveText('Counter: 1');

  await subtractEl!.click();
  await expect(h2El).toHaveText('Counter: 0');
}

async function styleShouldWork(page: Page) {
  const h2El = page.locator('.counter-text');
  await expect(h2El).toHaveCSS('font-size', '50px');

  const buttonEl = page.locator('#root button');
  await expect(buttonEl).toHaveCount(2);

  const [subtractEl, addEl] = await buttonEl.all();
  await expect(subtractEl!).toHaveCSS('background-color', 'rgb(255, 255, 0)');
  await expect(addEl!).toHaveCSS('background-color', 'rgb(255, 255, 0)');
}

test('should render example "vue-component-bundle" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: import.meta.dirname,
    page,
    environment: ['bundle'],
  });

  await counterCompShouldWork(page);
  await styleShouldWork(page);
  await rsbuild.close();
});

test('should render example "vue-component-bundle-false" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: import.meta.dirname,
    page,
    environment: ['bundleFalse'],
  });

  await counterCompShouldWork(page);
  await styleShouldWork(page);
  await rsbuild.close();
});
