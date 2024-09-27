import { dev } from '@e2e/helper/rsbuild';
import { expect, test } from '@playwright/test';

test('should render example "react-component" successfully', async ({
  page,
}) => {
  const rsbuild = await dev({
    cwd: __dirname,
    page,
  });

  const h2El = page.locator('h2');
  await expect(h2El).toHaveText('Counter: 0');

  const buttonEl = page.locator('#root button');

  const [subtractEl, addEl] = await buttonEl.all();

  await expect(h2El).toHaveText('Counter: 0');
  addEl?.click();
  await expect(h2El).toHaveText('Counter: 1');
  subtractEl?.click();
  await expect(h2El).toHaveText('Counter: 0');

  await rsbuild.close();
});
