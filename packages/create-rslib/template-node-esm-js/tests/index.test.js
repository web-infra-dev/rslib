import { expect, test } from '@rstest/core';
import { squared } from '../src/index.js';

test('squared', () => {
  expect(squared(2)).toBe(4);
  expect(squared(12)).toBe(144);
});
