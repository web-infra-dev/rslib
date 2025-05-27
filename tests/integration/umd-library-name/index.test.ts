import vm from 'node:vm';
import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

test('correct read UMD name from CommonJS', async () => {
  const fixturePath = __dirname;
  const { entries } = await buildAndGetResults({
    fixturePath,
  });

  const mockGlobalThis = {
    react: {
      version: '1.2.3',
    },
  };
  let context = vm.createContext({
    globalThis: mockGlobalThis,
  });

  vm.runInContext(entries.umd0!, context);

  // @ts-expect-error
  expect(await mockGlobalThis.MyLibrary.fn('ok')).toBe('DEBUG:1.2.3/ok');

  context = vm.createContext({
    globalThis: mockGlobalThis,
  });

  vm.runInContext(entries.umd1!, context);

  // @ts-expect-error
  expect(await mockGlobalThis.MyLibrary.Utils.fn('ok')).toBe('DEBUG:1.2.3/ok');
});
