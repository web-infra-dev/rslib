import { expect, test } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRslib } from '../src/createRslib';
import type { LibConfig } from '../src/types';
import type { RsbuildPlugin } from '@rsbuild/core';

test.each([
  { format: 'esm', bundle: true },
  { format: 'cjs', bundle: true },
  { format: 'esm', bundle: false },
  { format: 'cjs', bundle: false },
] as const)(
  'resolves bare self-references with $format and bundle=$bundle',
  async ({ format, bundle }) => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'rslib-self-')));
    try {
      await mkdir(join(root, 'src'));
      await writeFile(
        join(root, 'package.json'),
        JSON.stringify({ name: '@monorepo/self', type: 'module' }),
      );
      await writeFile(
        join(root, 'src/index.ts'),
        "export { a } from './a'; import { getB } from './b'; export const b = getB();",
      );
      await writeFile(
        join(root, 'src/a.ts'),
        "import { b } from '@monorepo/self'; export const a = () => b + 1;",
      );
      await writeFile(join(root, 'src/b.ts'), 'export const getB = () => 1;');
      const rslib = await createRslib({
        config: { root, lib: [{ format, bundle }] },
      });
      await rslib.build();
      const ext = format === 'esm' ? 'js' : 'cjs';
      const output = join(root, `dist/index.${ext}`);
      // In bundleless mode the self-import lives in the emitted `a` module.
      const code = await readFile(
        bundle ? output : join(root, `dist/a.${ext}`),
        'utf8',
      );
      expect(code).not.toMatch(/(?:from\s*|require\()['"]@monorepo\/self['"]/);
      expect(code).toContain(bundle ? 'a' : `./index.${ext}`);
      expect(
        execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `import { a } from ${JSON.stringify(pathToFileURL(output).href)}; console.log(a());`,
          ],
          { encoding: 'utf8' },
        ).trim(),
      ).toBe('2');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test.each<{
  label: string;
  entry: NonNullable<LibConfig['source']>['entry'];
  target: string | undefined;
}>([
  { label: 'implicit index', entry: undefined, target: 'src/index.ts' },
  {
    label: 'explicit index',
    entry: { index: './src/custom.ts' },
    target: 'src/custom.ts',
  },
  {
    label: 'sole named entry',
    entry: { main: './src/custom.ts' },
    target: 'src/custom.ts',
  },
  {
    label: 'array',
    entry: { index: ['./src/custom.ts'] },
    target: 'src/custom.ts',
  },
  {
    label: 'description',
    entry: { index: { import: ['./src/custom.ts'] } },
    target: 'src/custom.ts',
  },
  {
    label: 'multiple imports',
    entry: { index: ['./src/index.ts', './src/custom.ts'] },
    target: undefined,
  },
  {
    label: 'multiple entries',
    entry: { a: './src/index.ts', b: './src/custom.ts' },
    target: undefined,
  },
  {
    label: 'index among entries',
    entry: { index: './src/index.ts', b: './src/custom.ts' },
    target: 'src/index.ts',
  },
])('selects an unambiguous root for $label', async ({ entry, target }) => {
  const root = await mkdtemp(join(tmpdir(), 'rslib-self-entry-'));
  try {
    await mkdir(join(root, 'src'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ name: 'self' }),
    );
    await writeFile(join(root, 'src/index.ts'), '');
    await writeFile(join(root, 'src/custom.ts'), '');
    const rslib = await createRslib({ config: { root, source: { entry } } });
    const {
      origin: { bundlerConfigs },
    } = await rslib.inspectConfig();
    const aliases = bundlerConfigs[0]!.resolve?.alias;
    expect(
      Object.entries(aliases ?? {}).filter(([name]) => name === 'self$'),
    ).toEqual(target ? [['self$', join(root, target)]] : []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each<{
  label: string;
  entry: NonNullable<LibConfig['source']>['entry'];
  outBase: string | undefined;
}>([
  {
    label: 'named entries with outBase .',
    entry: { index: './src/index.ts', a: './src/a.ts' },
    outBase: '.',
  },
  {
    label: 'named entries with outBase src',
    entry: { index: './src/index.ts', a: './src/a.ts' },
    outBase: 'src',
  },
  { label: 'default glob with outBase .', entry: undefined, outBase: '.' },
  {
    label: 'sole glob key with outBase .',
    entry: { main: 'src/**' },
    outBase: '.',
  },
])('finds the bundleless root entry for $label', async ({ entry, outBase }) => {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), 'rslib-self-outbase-')),
  );
  try {
    await mkdir(join(root, 'src/nested'), { recursive: true });
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ name: 'self' }),
    );
    await writeFile(join(root, 'src/index.ts'), '');
    await writeFile(join(root, 'src/a.ts'), '');
    await writeFile(join(root, 'src/nested/index.ts'), '');
    const rslib = await createRslib({
      config: {
        root,
        lib: [{ bundle: false, outBase, source: { entry } }],
      },
    });
    const {
      origin: { bundlerConfigs },
    } = await rslib.inspectConfig();
    expect(bundlerConfigs[0]!.resolve?.alias).toHaveProperty(
      'self$',
      join(root, 'src/index'),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('follows a renamed bundleless root entry in watch mode', async () => {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), 'rslib-self-watch-')),
  );
  const builds: Array<(hasErrors: boolean) => void> = [];
  const nextBuild = () =>
    new Promise<boolean>((resolve) => {
      builds.push(resolve);
    });
  let close: (() => Promise<void>) | undefined;
  try {
    await mkdir(join(root, 'src'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ name: 'self', type: 'module' }),
    );
    await writeFile(join(root, 'src/index.ts'), 'export const b = 1;');
    await writeFile(
      join(root, 'src/a.ts'),
      "import { b } from 'self'; export const a = () => b + 1;",
    );
    const rslib = await createRslib({
      config: {
        root,
        lib: [{ bundle: false }],
        plugins: [
          {
            name: 'test:after-build',
            setup(api) {
              api.onAfterBuild(({ stats }) => {
                builds.shift()?.(Boolean(stats?.hasErrors()));
              });
            },
          } satisfies RsbuildPlugin,
        ],
      },
    });
    const firstBuild = nextBuild();
    ({ close } = await rslib.build({ watch: true }));
    expect(await firstBuild).toBe(false);

    const rebuild = nextBuild();
    await rename(join(root, 'src/index.ts'), join(root, 'src/index.tsx'));
    await writeFile(
      join(root, 'src/a.ts'),
      "import { b } from 'self'; export const a = () => b + 2;",
    );
    expect(await rebuild).toBe(false);
    const code = await readFile(join(root, 'dist/a.js'), 'utf8');
    expect(code).toContain('b + 2');
    expect(code).toContain('./index.js');
    expect(code).not.toMatch(/from\s*['"]self['"]/);
  } finally {
    await close?.();
    await rm(root, { recursive: true, force: true });
  }
});

test('keeps self-reference targets local to each lib environment', async () => {
  const root = await mkdtemp(join(tmpdir(), 'rslib-self-libs-'));
  try {
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ name: 'self' }),
    );
    await writeFile(join(root, 'a.ts'), '');
    await writeFile(join(root, 'b.ts'), '');
    const rslib = await createRslib({
      config: {
        root,
        lib: [
          { source: { entry: { index: './a.ts' } } },
          { source: { entry: { index: './b.ts' } } },
        ],
      },
    });
    const {
      origin: { bundlerConfigs },
    } = await rslib.inspectConfig();
    expect(bundlerConfigs.map((config) => config.resolve?.alias)).toEqual([
      expect.objectContaining({ self$: join(root, 'a.ts') }),
      expect.objectContaining({ self$: join(root, 'b.ts') }),
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each([
  {
    label: 'string exports',
    pkg: { name: 'self', exports: './src/custom.ts' },
  },
  {
    label: 'conditional exports',
    pkg: { name: 'self', exports: { import: './src/custom.ts' } },
  },
  { label: 'empty exports', pkg: { name: 'self', exports: {} } },
  { label: 'null exports', pkg: { name: 'self', exports: null } },
  { label: 'missing package', pkg: undefined },
  { label: 'missing name', pkg: {} },
  { label: 'empty name', pkg: { name: '' } },
  { label: 'blank name', pkg: { name: ' ' } },
  { label: 'non-string name', pkg: { name: 42 } },
  { label: 'malformed JSON', pkg: '{' },
])('preserves package handling for $label', async ({ pkg }) => {
  const root = await mkdtemp(join(tmpdir(), 'rslib-self-package-'));
  try {
    await mkdir(join(root, 'src'));
    await writeFile(join(root, 'src/index.ts'), '');
    if (pkg !== undefined) {
      await writeFile(
        join(root, 'package.json'),
        typeof pkg === 'string' ? pkg : JSON.stringify(pkg),
      );
    }
    const result = await createRslib({ config: { root } })
      .then((rslib) => rslib.inspectConfig())
      .then(
        ({ origin: { bundlerConfigs } }) =>
          Object.keys(bundlerConfigs[0]!.resolve?.alias ?? {}).includes(
            'self$',
          ),
        (error: Error) => error.constructor,
      );
    expect(result).toBe(typeof pkg === 'string' ? SyntaxError : false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['@monorepo/self$', '@monorepo/self', '@monorepo'])(
  'preserves user alias %s including false',
  async (key) => {
    const root = await mkdtemp(join(tmpdir(), 'rslib-self-alias-'));
    try {
      await mkdir(join(root, 'src'));
      await writeFile(join(root, 'src/index.ts'), '');
      await writeFile(
        join(root, 'package.json'),
        JSON.stringify({ name: '@monorepo/self' }),
      );
      const rslib = await createRslib({
        config: {
          root,
          resolve: { alias: { [key]: false, unrelated: './other.ts' } },
        },
      });
      const {
        origin: { bundlerConfigs },
      } = await rslib.inspectConfig();
      const aliases = bundlerConfigs[0]!.resolve?.alias;
      expect(aliases).toMatchObject({
        [key]: false,
        unrelated: join(root, 'other.ts'),
      });
      expect(Object.keys(aliases ?? {}).includes('@monorepo/self$')).toBe(
        key === '@monorepo/self$',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test.each([
  'exports',
  'missing exports',
  'explicit alias',
  'external',
] as const)('retains resolver behavior for %s', async (mode) => {
  const root = await mkdtemp(join(tmpdir(), 'rslib-self-exports-'));
  try {
    await mkdir(join(root, 'src'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        name: 'self',
        type: 'module',
        ...(mode !== 'external'
          ? { exports: mode === 'exports' ? './src/other.ts' : './missing.js' }
          : {}),
      }),
    );
    await writeFile(
      join(root, 'src/index.ts'),
      "export { value } from 'self';",
    );
    await writeFile(join(root, 'src/other.ts'), 'export const value = 7;');
    const rslib = await createRslib({
      config: {
        root,
        ...(mode === 'explicit alias'
          ? { resolve: { alias: { self$: join(root, 'src/other.ts') } } }
          : {}),
        ...(mode === 'external' ? { output: { externals: ['self'] } } : {}),
      },
    });
    const result = await rslib.build().then(
      async () => {
        const output = join(root, 'dist/index.js');
        if (mode === 'external') {
          return /from ['"]self['"]/.test(await readFile(output, 'utf8'));
        }
        return execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `import { value } from ${JSON.stringify(pathToFileURL(output).href)}; console.log(value);`,
          ],
          { encoding: 'utf8' },
        ).trim();
      },
      (error: Error) => error.message,
    );
    expect(result).toBe(
      mode === 'missing exports'
        ? 'Rspack build failed.'
        : mode === 'external'
          ? true
          : '7',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['self', '@monorepo/self'])(
  'does not capture subpaths or similarly prefixed names of %s',
  async (name) => {
    const root = await mkdtemp(join(tmpdir(), 'rslib-self-exact-'));
    try {
      await mkdir(join(root, 'src'));
      await writeFile(
        join(root, 'package.json'),
        JSON.stringify({ name, type: 'module' }),
      );
      await writeFile(
        join(root, 'src/index.ts'),
        `
        import { sub } from '${name}/sub';
        import { prefix } from '${name}-other';
        export const value = sub + prefix;
      `,
      );
      await writeFile(join(root, 'src/sub.ts'), 'export const sub = 2;');
      await writeFile(join(root, 'src/other.ts'), 'export const prefix = 3;');
      const rslib = await createRslib({
        config: {
          root,
          resolve: {
            alias: {
              [`${name}/sub$`]: join(root, 'src/sub.ts'),
              [`${name}-other$`]: join(root, 'src/other.ts'),
            },
          },
        },
      });
      const {
        origin: { bundlerConfigs },
      } = await rslib.inspectConfig();
      expect(bundlerConfigs[0]!.resolve?.alias).toHaveProperty(
        `${name}$`,
        join(root, 'src/index.ts'),
      );
      await rslib.build();
      expect(
        execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `import { value } from ${JSON.stringify(pathToFileURL(join(root, 'dist/index.js')).href)}; console.log(value);`,
          ],
          { encoding: 'utf8' },
        ).trim(),
      ).toBe('5');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
