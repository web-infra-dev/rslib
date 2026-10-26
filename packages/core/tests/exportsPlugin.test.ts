import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ExportsPlugin } from '../src/exports/plugin';
import { logger } from '../src/utils/logger';

rs.mock('../src/utils/logger', () => ({
  logger: { info: rs.fn(), warn: rs.fn(), error: rs.fn() },
}));

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function createFixture(watch: boolean) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rslib-exports-plugin-'));
  roots.push(root);
  const pkgPath = path.join(root, 'package.json');
  const callbacks: Array<(params: { stats: Rspack.Stats }) => void> = [];
  ExportsPlugin({
    root,
    libInfos: [{ id: 'esm', format: 'esm', config: {} }],
    watch,
  }).setup({
    onAfterBuild: (callback: (typeof callbacks)[number]) => {
      callbacks.push(callback);
    },
  } as unknown as RsbuildPluginAPI);

  const stats = () => {
    const errors: Error[] = [];
    return {
      hasErrors: () => errors.length > 0,
      compilation: {
        name: 'esm',
        errors,
        outputOptions: { path: path.join(root, 'dist') },
        entrypoints: new Map([
          [
            'index',
            { getEntrypointChunk: () => ({ files: new Set(['index.js']) }) },
          ],
        ]),
      },
    } as unknown as Rspack.Stats;
  };
  return { pkgPath, run: callbacks[0]!, stats };
}

describe('exports build failures', () => {
  it('reports watch failures without failing the build and recovers on the next build', () => {
    const { pkgPath, run, stats } = createFixture(true);
    const original = JSON.stringify({ exports: './old.js' });
    fs.writeFileSync(pkgPath, original);
    const failed = stats();

    expect(() => run({ stats: failed })).not.toThrow();
    expect(failed.hasErrors()).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('subpath map'),
      }),
    );
    expect(fs.readFileSync(pkgPath, 'utf8')).toBe(original);

    fs.writeFileSync(pkgPath, '{}');
    run({ stats: stats() });
    expect(JSON.parse(fs.readFileSync(pkgPath, 'utf8')).exports).toEqual({
      '.': './dist/index.js',
    });
  });

  it('reports recovery once when package.json is already up to date', () => {
    const { pkgPath, run, stats } = createFixture(true);
    fs.writeFileSync(pkgPath, JSON.stringify({ exports: './old.js' }));
    run({ stats: stats() });

    const upToDate = `${JSON.stringify({ exports: { '.': './dist/index.js' } }, null, 2)}\n`;
    fs.writeFileSync(pkgPath, upToDate);
    run({ stats: stats() });
    run({ stats: stats() });
    expect(fs.readFileSync(pkgPath, 'utf8')).toBe(upToDate);
    const recoveryLogs = rs
      .mocked(logger.info)
      .mock.calls.filter(
        ([message]) =>
          message === '"exports" field in package.json is up to date.',
      );
    expect(recoveryLogs).toHaveLength(1);
  });

  it('throws exports errors in a one-off build', () => {
    const { pkgPath, run, stats } = createFixture(false);
    fs.writeFileSync(pkgPath, JSON.stringify({ exports: './old.js' }));
    expect(() => run({ stats: stats() })).toThrow('subpath map');
  });
});
