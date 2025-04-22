import { join } from 'node:path';
import { buildAndGetResults } from 'test-helper';
import { describe, expect, test } from 'vitest';

const globalPolyfillResult = `const value = [
    '1'
].splice(0, 1)`;

describe('polyfill', async () => {
  const fixturePath = join(__dirname);
  const { entries, entryFiles } = await buildAndGetResults({ fixturePath });

  test('should polyfill in ESM', async () => {
    expect(entries.esm0).not.toContain(globalPolyfillResult);
    expect(entries.esm0).toMatch(
      /import \* as .* from "core-js-pure\/stable\/instance\/splice\.js"/,
    );
    const result = (await import(entryFiles.esm0!)).value;
    expect(result).toEqual(['1']);
  });

  test('should polyfill in CJS', async () => {
    expect(entries.cjs).not.toContain(globalPolyfillResult);
    expect(entries.cjs).toMatch(
      /const splice_js_namespaceObject = require\("core-js-pure\/stable\/instance\/splice\.js"\)/,
    );
    const result = (await import(entryFiles.cjs!)).value;
    expect(result).toEqual(['1']);
  });

  test('should not polyfill when targets is modern enough', async () => {
    expect(entries.esm1).toMatchInlineSnapshot(`
      "const value = [
          '1'
      ].splice(0, 1);
      export { value };
      "
    `);
  });
});
