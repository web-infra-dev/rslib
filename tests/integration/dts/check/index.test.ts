import { join, normalize } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults, proxyConsole } from 'test-helper';

describe('check tsconfig.json field', async () => {
  test('check whether declarationDir is resolved outside from project root', async () => {
    const fixturePath = join(__dirname, 'outside-root');
    const { logs, restore } = proxyConsole();
    const { files } = await buildAndGetResults({
      fixturePath,
      type: 'dts',
    });
    const logStrings = logs.map((log) => stripAnsi(log));
    restore();

    const expectDeclarationDir = normalize(join(__dirname, 'tsconfig/dist'));
    const expectRoot = normalize(join(__dirname, 'outside-root'));

    expect(
      logStrings.some((log) =>
        log.includes(
          `The resolved declarationDir ${expectDeclarationDir} is outside the project root ${expectRoot}, please check your tsconfig file.`,
        ),
      ),
    ).toEqual(true);

    expect(files.esm).toMatchInlineSnapshot('undefined');
  });
});
