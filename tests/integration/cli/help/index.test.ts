import { expect, test } from '@rstest/core';
import { runCliSync } from 'test-helper';

const normalizeHelp = (output: string) =>
  output
    .replace(/^Rslib v.+$/m, 'Rslib v<version>')
    .replace(/[ \t]+$/gm, '')
    .trim();

for (const [name, command] of [
  ['root', '-h'],
  ['build', 'build -h'],
  ['inspect', 'inspect -h'],
  ['mf-dev', 'mf-dev -h'],
] as const) {
  test(`should show ${name} help`, () => {
    const { status, stdout } = runCliSync(command);

    expect(status).toBe(0);
    expect(normalizeHelp(stdout)).toMatchSnapshot();
  });
}
