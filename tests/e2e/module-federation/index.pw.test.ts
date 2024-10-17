/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { libText, remoteText } from './constant';

test.beforeEach(async ({ page }) => {
  const openUrl = 'http://localhost:3000';
  await page.goto(openUrl);
});

test('test rslib module render correctly', async ({ page }) => {
  const libTitleElement = await page.waitForSelector('#mf-e2e-lib-title');
  const libContentElement = await page.waitForSelector('#mf-e2e-lib-content');
  const libTitleText = await libTitleElement.innerText();
  const libContentText = await libContentElement.innerText();
  expect(libTitleText).toEqual(expect.stringContaining(libText));
  expect(libContentText).toBe('0');

  const libIncreaseElement = await page.waitForSelector('#mf-e2e-lib-increase');
  const libDecreaseElement = await page.waitForSelector('#mf-e2e-lib-decrease');

  await libIncreaseElement.click();
  const libIncreaseContent = await libContentElement.innerText();
  expect(libIncreaseContent).toBe('1');

  await libDecreaseElement.click();
  const libDecreaseContent = await libContentElement.innerText();
  expect(libDecreaseContent).toBe('0');
});

test('test rslib use mf runtime to load remote module', async ({ page }) => {
  const runtimeElement = await page.waitForSelector('#mf-e2e-remote');
  const runtimeText = await runtimeElement.innerText();
  expect(runtimeText).toEqual(expect.stringContaining(remoteText));
});
