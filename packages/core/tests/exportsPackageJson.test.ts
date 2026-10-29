import { describe, expect, it } from '@rstest/core';
import { stringifyPackageJson } from '../src/exports/packageJson';

describe('stringifyPackageJson', () => {
  const content = { name: 'pkg', exports: { '.': './dist/index.mjs' } };

  it('should use two spaces when the original text has no indentation', () => {
    expect(stringifyPackageJson(content, '{}')).toBe(
      JSON.stringify(content, null, 2),
    );
  });

  it('should preserve tab indentation and the trailing newline', () => {
    expect(stringifyPackageJson(content, '{\n\t"name": "pkg"\n}\n')).toBe(
      `${JSON.stringify(content, null, '\t')}\n`,
    );
  });

  it('should preserve four-space indentation and CRLF line endings', () => {
    expect(
      stringifyPackageJson(content, '{\r\n    "name": "pkg"\r\n}\r\n'),
    ).toBe(`${JSON.stringify(content, null, 4).replaceAll('\n', '\r\n')}\r\n`);
  });
});
