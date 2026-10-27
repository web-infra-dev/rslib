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

describe('shebang', async () => {
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

    test('keeps the shebang before CJS strict mode', () => {
      expect(onlyStartsWith(entries.cjs0!, '#!/usr/bin/env node')).toBe(true);
      expect(getOpeningStatements(entries.cjs0!, 2)).toEqual([
        '#!/usr/bin/env node',
        '"use strict"',
      ]);
    });
  });

  describe('bundleless', async () => {
    test('keeps the shebang before CJS strict mode without minification', () => {
      const { content } = queryContent(contents.cjs1!, 'index.cjs', {
        basename: true,
      });
      expect(onlyStartsWith(content!, '#!/usr/bin/env node')).toBe(true);
      expect(getOpeningStatements(content!, 2)).toEqual([
        '#!/usr/bin/env node',
        '"use strict"',
      ]);
    });

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
  const fixturePath = join(__dirname, 'react');
  const { contents } = await buildAndGetResults({ fixturePath });

  test.each([
    {
      mode: 'bundle',
      format: 'esm',
      files: contents.esm0!,
      extension: 'js',
      prefix: [],
    },
    {
      mode: 'bundle',
      format: 'cjs',
      files: contents.cjs0!,
      extension: 'cjs',
      prefix: ['"use strict"'],
    },
    {
      mode: 'bundleless',
      format: 'esm',
      files: contents.esm1!,
      extension: 'js',
      prefix: [],
    },
    {
      mode: 'bundleless',
      format: 'cjs',
      files: contents.cjs1!,
      extension: 'cjs',
      prefix: ['"use strict"'],
    },
  ])(
    'preserves React directives at the top of $format files ($mode)',
    ({ files, extension, prefix }) => {
      for (const [name, directive] of [
        ['foo', '"use client"'],
        ['bar', '"use server"'],
      ] as const) {
        const { content } = queryContent(files, `${name}.${extension}`, {
          basename: true,
        });
        expect(getOpeningStatements(content!, prefix.length + 1)).toEqual([
          ...prefix,
          directive,
        ]);
        expect(content!.split(directive)).toHaveLength(2);
      }
    },
  );
});

describe('shims with shebang and directives', async () => {
  const fixturePath = join(__dirname, 'shims');
  const { contents } = await buildAndGetResults({ fixturePath });

  test.each([
    {
      format: 'esm',
      scenario: 'bundle, default minify',
      files: contents.esm0!,
    },
    { format: 'esm', scenario: 'bundleless, no minify', files: contents.esm1! },
    {
      format: 'cjs',
      scenario: 'bundle, default minify',
      files: contents.cjs0!,
    },
    { format: 'cjs', scenario: 'bundleless, no minify', files: contents.cjs1! },
  ])(
    'keeps the prologue before shims ($format, $scenario)',
    ({ format, files }) => {
      const extension = format === 'esm' ? 'js' : 'cjs';
      const strict = format === 'cjs' ? ['"use strict"'] : [];
      for (const [name, directive] of [
        ['shebang', '"use client"'],
        ['directive', '"use server"'],
      ] as const) {
        const { content } = queryContent(files, `${name}.${extension}`, {
          basename: true,
        });
        const prologue = [...strict, directive];
        if (name === 'shebang') {
          prologue.unshift('#!/usr/bin/env node');
        }
        expect(onlyStartsWith(content!, '#!/usr/bin/env node')).toBe(
          name === 'shebang',
        );
        expect(getOpeningStatements(content!, prologue.length)).toEqual(
          prologue,
        );
        expect(content!.split(directive)).toHaveLength(2);
        // Ensure the shim is present so the ordering regression is exercised.
        expect(content).toContain(
          format === 'esm' ? 'createRequire' : '__rslib_import_meta_url__',
        );
      }
    },
  );
});
