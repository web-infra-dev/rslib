import { expect, test } from '@rstest/core';
import { prettyTime } from '../src/utils';

test('should pretty time correctly', () => {
  expect(prettyTime(0.0012)).toEqual('0.001 s');
  expect(prettyTime(0.0123)).toEqual('0.01 s');
  expect(prettyTime(0.1234)).toEqual('0.12 s');
  expect(prettyTime(1.234)).toEqual('1.23 s');
  expect(prettyTime(12.34)).toEqual('12.3 s');
  expect(prettyTime(120)).toEqual('2 m');
  expect(prettyTime(123.4)).toEqual('2 m 3.4 s');
  expect(prettyTime(1234)).toEqual('20 m 34 s');
  expect(prettyTime(1234.5)).toEqual('20 m 34.5 s');
});
