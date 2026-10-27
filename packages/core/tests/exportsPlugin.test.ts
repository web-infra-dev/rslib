import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ExportsPlugin } from '../src/exports/plugin';

rs.mock('../src/utils/logger', () => ({
  logger: { info: rs.fn(), warn: rs.fn(), error: rs.fn() },
}));

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rslib-exports-plugin-'));
  roots.push(root);
  const pkgPath = path.join(root, 'package.json');
  const callbacks: Array<(params: { stats: Rspack.Stats }) => void> = [];
  ExportsPlugin({
    root,
    libInfos: [{ id: 'esm', format: 'esm', config: {} }],
  }).setup({
    onAfterBuild: (callback: (typeof callbacks)[number]) => {
      callbacks.push(callback);
    },
  } as unknown as RsbuildPluginAPI);

  const stats = {
    hasErrors: () => false,
    compilation: {
      name: 'esm',
      errors: [],
      outputOptions: { path: path.join(root, 'dist') },
      entrypoints: new Map([
        [
          'index',
          { getEntrypointChunk: () => ({ files: new Set(['index.js']) }) },
        ],
      ]),
    },
  } as unknown as Rspack.Stats;
  return { pkgPath, run: callbacks[0]!, stats };
}

describe('exports build failures', () => {
  it('throws exports errors', () => {
    const { pkgPath, run, stats } = createFixture();
    fs.writeFileSync(pkgPath, JSON.stringify({ exports: './old.js' }));
    expect(() => run({ stats })).toThrow('subpath map');
  });
});
