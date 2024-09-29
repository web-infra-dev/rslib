import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('decorators default to 2022-03', async () => {
  const fixturePath = join(__dirname, 'default');
  const { entries } = await buildAndGetResults(fixturePath);

  // use 2022-03 decorator by default
  expect(entries.esm).toMatchSnapshot();
});

test('decorators with experimentalDecorators in tsconfig', async () => {
  const fixturePath = join(__dirname, 'tsconfig');
  const { entries } = await buildAndGetResults(fixturePath);

  // use legacy decorator when experimentalDecorators in tsconfig
  expect(entries.esm0).toMatchSnapshot();
  // use 2022-03 if config source.decorators
  expect(entries.esm1).toMatchSnapshot();
});
