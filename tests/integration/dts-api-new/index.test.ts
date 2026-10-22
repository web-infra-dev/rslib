import { describe, expect, test } from '@rstest/core';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { buildAndGetResults, getFileBySuffix, rslibBuild } from 'test-helper';

describe('TypeScript 7.1 stable JavaScript API', () => {
  const mapperPath = join(__dirname, 'content-mapper');

  test('uses the executable for build mode and builds project references', async () => {
    const buildPath = join(__dirname, 'build');
    const referenceOutput = join(__dirname, 'reference/dist/index.d.ts');
    await fs.rm(join(__dirname, 'reference/dist'), {
      recursive: true,
      force: true,
    });
    const { buildResult } = await rslibBuild({ cwd: buildPath });
    await buildResult.close();
    expect(
      await fs.readFile(join(buildPath, 'dist/index.d.ts'), 'utf8'),
    ).toContain('value = "main"');
    expect(await fs.readFile(referenceOutput, 'utf8')).toContain(
      'referenced = "reference"',
    );
    await expect(
      fs.access(join(__dirname, 'reference/dist/tsconfig.tsbuildinfo')),
    ).resolves.toBeUndefined();
  });

  test('emits content-mapped declarations with API, bundle and executable', async () => {
    const { contents } = await buildAndGetResults({
      fixturePath: mapperPath,
      type: 'dts',
    });
    const output = Object.assign({}, ...Object.values(contents));
    for (const file of [
      'api/message.d.txt.ts',
      'bundle/index.d.ts',
      'executable/message.d.txt.ts',
    ]) {
      const declaration = getFileBySuffix(output, file);
      expect(declaration).toContain('"Hello from content mapper"');
      expect(declaration).toContain('// mapper banner');
      expect(declaration).toContain('// mapper footer');
    }
  });
});
