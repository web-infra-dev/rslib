import fs from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { buildAndGetResults, queryContent } from 'test-helper';

const onlyStartsWith = (str: string, target: string) => {
  return str.split(target).length === 2 && str.startsWith(target);
};

describe('shebang', async () => {
  const fixturePath = join(__dirname, 'shebang');
  const { entries, contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  describe('bundle', async () => {
    test('shebang at the beginning', async () => {
      expect(onlyStartsWith(entries.esm0!, '#!/usr/bin/env node')).toBe(true);
    });

    test('shebang at the beginning even if minified', async () => {
      expect(onlyStartsWith(entries.esm1!, '#!/usr/bin/env node')).toBe(true);
    });
  });

  describe('bundle-false', async () => {
    test('shebang at the beginning', async () => {
      const { content: index } = queryContent(contents.esm2!, 'index.js', {
        basename: true,
      });
      expect(onlyStartsWith(index!, '#!/usr/bin/env node')).toBe(true);

      const { content: bar } = queryContent(contents.esm2!, 'bar.js', {
        basename: true,
      });
      expect(onlyStartsWith(bar!, '#!/usr/bin/env node')).toBe(true);

      const { content: foo } = queryContent(contents.esm2!, 'foo.js', {
        basename: true,
      });
      expect(foo!.includes('#!')).toBe(false);
    });

    test('shebang at the beginning even if minified', async () => {
      const { content: index } = queryContent(contents.esm3!, 'index.js', {
        basename: true,
      });
      expect(onlyStartsWith(index!, '#!/usr/bin/env node')).toBe(true);

      const { content: bar } = queryContent(contents.esm3!, 'bar.js', {
        basename: true,
      });
      expect(onlyStartsWith(bar!, '#!/usr/bin/env node')).toBe(true);

      const { content: foo } = queryContent(contents.esm2!, 'foo.js', {
        basename: true,
      });
      expect(foo!.includes('#!')).toBe(false);
    });

    test.todo('shebang commented by JS parser should be striped', async () => {
      const { content: index } = queryContent(contents.esm3!, 'index.js', {
        basename: true,
      });
      expect(index!.includes('//#!')).toBe(false);

      const { content: bar } = queryContent(contents.esm3!, 'bar.js', {
        basename: true,
      });
      expect(bar!.includes('//#!')).toBe(false);
    });
  });

  // Windows uses Access Control Lists (ACLs) for file permissions, which are represented differently from Linux modes.
  // The mode in CI is not stable on Windows, it might be 100644, 100666 and others probably.
  describe.runIf(os.platform() !== 'win32')('chmod', async () => {
    test('shebang at the beginning', async () => {
      const filePath = entryFiles.esm0!;
      const fileStats = fs.statSync(filePath);
      expect(fileStats.mode).toBe(0o100755);
    });

    test('shebang at the beginning even if minified', async () => {
      const filePath = entryFiles.esm1!;
      const fileStats = fs.statSync(filePath);
      expect(fileStats.mode).toBe(0o100755);
    });
  });
});

describe('react', async () => {
  const fixturePath = join(__dirname, 'react/bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  describe('bundle-false', async () => {
    test('React directive at the beginning', async () => {
      const { content: foo } = queryContent(contents.esm!, 'foo.js', {
        basename: true,
      });
      expect(onlyStartsWith(foo!, `'use client';`)).toBe(true);

      const { content: bar } = queryContent(contents.esm!, 'bar.js', {
        basename: true,
      });
      expect(onlyStartsWith(bar!, `'use server';`)).toBe(true);
    });

    test('React directive at the beginning even if minified', async () => {
      const { content: foo } = queryContent(contents.cjs!, 'foo.cjs', {
        basename: true,
      });
      expect(onlyStartsWith(foo!, `'use client';`)).toBe(true);

      const { content: bar } = queryContent(contents.cjs!, 'bar.cjs', {
        basename: true,
      });
      expect(onlyStartsWith(bar!, `'use server';`)).toBe(true);
    });
  });
});
