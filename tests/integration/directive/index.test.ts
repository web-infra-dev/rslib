import fs from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';
import { describe, expect, test } from 'vitest';

// The test for `import.meta.url` shim is in tests/integration/shims/index.test.ts

describe('shebang', async () => {
  const fixturePath = join(__dirname, 'shebang');
  const { entries, contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  describe('bundle', async () => {
    test('shebang at the beginning', async () => {
      expect(entries.esm0!.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    test('shebang at the beginning even if minified', async () => {
      expect(entries.esm1!.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  describe('bundle-false', async () => {
    test('shebang at the beginning', async () => {
      const { content: index } = queryContent(contents.esm2!, 'index.js', {
        basename: true,
      });
      expect(index!.startsWith('#!/usr/bin/env node')).toBe(true);

      const { content: bar } = queryContent(contents.esm2!, 'bar.js', {
        basename: true,
      });
      expect(bar!.startsWith('#!/usr/bin/env node')).toBe(true);

      const { content: foo } = queryContent(contents.esm2!, 'foo.js', {
        basename: true,
      });
      expect(foo!.includes('#!')).toBe(false);
    });

    test('shebang at the beginning even if minified', async () => {
      const { content: index } = queryContent(contents.esm3!, 'index.js', {
        basename: true,
      });
      expect(index!.startsWith('#!/usr/bin/env node')).toBe(true);

      const { content: bar } = queryContent(contents.esm3!, 'bar.js', {
        basename: true,
      });
      expect(bar!.startsWith('#!/usr/bin/env node')).toBe(true);

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
      const { content: foo } = queryContent(contents.esm0!, 'foo.js', {
        basename: true,
      });
      expect(foo!.startsWith(`'use client';`)).toBe(true);

      const { content: bar } = queryContent(contents.esm0!, 'bar.js', {
        basename: true,
      });
      expect(bar!.startsWith(`'use server';`)).toBe(true);
    });

    test('React directive at the beginning even if minified', async () => {
      const { content: foo } = queryContent(contents.esm1!, 'foo.js', {
        basename: true,
      });
      expect(foo!.startsWith(`'use client';`)).toBe(true);

      const { content: bar } = queryContent(contents.esm1!, 'bar.js', {
        basename: true,
      });
      expect(bar!.startsWith(`'use server';`)).toBe(true);
    });
  });
});
