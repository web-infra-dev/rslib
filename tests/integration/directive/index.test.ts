import { describe, expect, test } from '@rstest/core';
import fs from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import { buildAndGetResults, queryContent } from 'test-helper';

const onlyStartsWith = (str: string, target: string) => {
  return str.split(target).length === 2 && str.startsWith(target);
};

// These fixtures separate leading directives with semicolons or newlines.
const getOpeningStatements = (content: string, count: number) =>
  content
    .trimStart()
    .split(/;\s*|\r?\n\s*/, count)
    .map((statement) => statement.trim());

describe('shebang and directives', async () => {
  const fixturePath = join(__dirname, 'shebang');
  const { entries, contents, entryFiles } = await buildAndGetResults({
    fixturePath,
  });

  describe('bundle', async () => {
    test.each([
      { minify: 'default', content: entries.esm0! },
      { minify: 'enabled', content: entries.esm1! },
    ])('preserves the ESM entry shebang (minify: $minify)', ({ content }) => {
      expect(onlyStartsWith(content, '#!/usr/bin/env node')).toBe(true);
    });

    test.each([
      { minify: 'default', content: entries.cjs0! },
      { minify: 'disabled', content: entries.cjs1! },
      { minify: 'enabled, join_vars disabled', content: entries.cjs2! },
      { minify: 'enabled, join_vars enabled', content: entries.cjs6! },
    ])(
      'keeps the shebang and directives before the CJS shim (minify: $minify)',
      ({ content }) => {
        expect(onlyStartsWith(content, '#!/usr/bin/env node')).toBe(true);
        expect(getOpeningStatements(content, 3)).toEqual([
          '#!/usr/bin/env node',
          '"use strict"',
          '"use client"',
        ]);
      },
    );
  });

  describe('bundleless', async () => {
    test.each([
      { minify: 'default', files: contents.cjs3! },
      { minify: 'disabled', files: contents.cjs4! },
      { minify: 'enabled, join_vars disabled', files: contents.cjs5! },
      { minify: 'enabled, join_vars enabled', files: contents.cjs7! },
    ])(
      'keeps the shebang and directives before the CJS shim (minify: $minify)',
      ({ files }) => {
        const { content } = queryContent(files, 'index.cjs', {
          basename: true,
        });
        expect(onlyStartsWith(content!, '#!/usr/bin/env node')).toBe(true);
        expect(getOpeningStatements(content!, 3)).toEqual([
          '#!/usr/bin/env node',
          '"use strict"',
          '"use client"',
        ]);
      },
    );

    test.each([
      { minify: 'default', files: contents.esm2! },
      { minify: 'enabled', files: contents.esm3! },
    ])('preserves each ESM entry shebang (minify: $minify)', ({ files }) => {
      const { content: index } = queryContent(files, 'index.js', {
        basename: true,
      });
      expect(onlyStartsWith(index!, '#!/usr/bin/env node')).toBe(true);

      const { content: bar } = queryContent(files, 'bar.js', {
        basename: true,
      });
      expect(onlyStartsWith(bar!, '#!/usr/bin/env node')).toBe(true);

      const { content: foo } = queryContent(files, 'foo.js', {
        basename: true,
      });
      expect(foo!.includes('#!')).toBe(false);
    });

    test('removes commented-out shebangs from minified ESM entries', async () => {
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
    test.each([
      { minify: 'default', file: entryFiles.esm0! },
      { minify: 'enabled', file: entryFiles.esm1! },
    ])('marks the ESM entry as executable (minify: $minify)', ({ file }) => {
      const fileStats = fs.statSync(file);
      expect(fileStats.mode).toBe(0o100755);
    });
  });
});

describe('React directives', async () => {
  const fixturePath = join(__dirname, 'react/bundleless');
  const { contents } = await buildAndGetResults({ fixturePath });

  describe('bundleless', async () => {
    test('preserves React directives at the beginning of ESM files', async () => {
      const { content: foo } = queryContent(contents.esm!, 'foo.js', {
        basename: true,
      });
      expect(onlyStartsWith(foo!, `"use client";`)).toBe(true);

      const { content: bar } = queryContent(contents.esm!, 'bar.js', {
        basename: true,
      });
      expect(onlyStartsWith(bar!, `"use server";`)).toBe(true);
    });

    test.each([
      { minify: 'default', files: contents.cjs1! },
      { minify: 'disabled', files: contents.cjs2! },
      { minify: 'enabled, join_vars disabled', files: contents.cjs0! },
      { minify: 'enabled, join_vars enabled', files: contents.cjs3! },
    ])(
      'keeps strict mode and React directives before the CJS shim (minify: $minify)',
      ({ files }) => {
        const { content: foo } = queryContent(files, 'foo.cjs', {
          basename: true,
        });
        expect(getOpeningStatements(foo!, 2)).toEqual([
          '"use strict"',
          '"use client"',
        ]);
        expect(foo!.split('"use client"')).toHaveLength(2);

        const { content: bar } = queryContent(files, 'bar.cjs', {
          basename: true,
        });
        expect(getOpeningStatements(bar!, 2)).toEqual([
          '"use strict"',
          '"use server"',
        ]);
        expect(bar!.split('"use server"')).toHaveLength(2);
      },
    );
  });
});
