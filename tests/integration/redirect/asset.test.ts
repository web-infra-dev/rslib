import path from 'node:path';
import { beforeAll, expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

let contents: Awaited<ReturnType<typeof buildAndGetResults>>['contents'];

beforeAll(async () => {
  const fixturePath = path.resolve(__dirname, './asset');
  contents = (await buildAndGetResults({ fixturePath })).contents;
});

test('0. default', async () => {
  const { content: indexJs } = queryContent(contents.esm0!, /index\.js/);
  const { content: indexCjs } = queryContent(contents.cjs0!, /index\.cjs/);
  expect(indexJs).toContain('import logo from "./assets/logo.js";');
  expect(indexCjs).toContain('require("./assets/logo.cjs")');
});

test('1. redirect.asset.extension = false', async () => {
  const { content: indexJs } = queryContent(contents.esm1!, /index\.js/);
  const { content: indexCjs } = queryContent(contents.cjs1!, /index\.cjs/);
  expect(indexJs).toContain('import logo from "./assets/logo.svg";');
  expect(indexCjs).toContain('require("./assets/logo.svg")');
});

test('2. redirect.asset.path = false', async () => {
  const { content: indexJs } = queryContent(contents.esm2!, /index\.js/);
  const { content: indexCjs } = queryContent(contents.cjs2!, /index\.cjs/);
  expect(indexJs).toContain('import logo from "@/assets/logo.js";');
  expect(indexCjs).toContain('require("@/assets/logo.cjs")');
});

test('3. redirect.asset.path = false, redirect.js.path = false', async () => {
  const { content: indexJs } = queryContent(contents.esm3!, /index\.js/);
  const { content: indexCjs } = queryContent(contents.cjs3!, /index\.cjs/);
  expect(indexJs).toContain('import logo from "@/assets/logo.svg";');
  expect(indexCjs).toContain('require("@/assets/logo.svg")');
});
