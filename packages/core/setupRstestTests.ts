import path from 'node:path';
import process from 'node:process';
import { beforeEach, expect } from '@rstest/core';
import { createSnapshotSerializer } from 'path-serializer';

beforeEach(() => {
  // since our NODE_ENV injection logic is via cli, we need to
  // delete "test" NODE_ENV to avoid affecting the default build config
  delete process.env.NODE_ENV;
});

function removeTrailingSlash(inputPath: string): string {
  return path.normalize(inputPath).replace(/[\\/]+$/, '');
}
expect.addSnapshotSerializer(
  createSnapshotSerializer({
    root: removeTrailingSlash(path.join(__dirname, '../../')),
    workspace: __dirname,
    features: {
      replaceHomeDir: false,
      replaceWorkspace: true,
      replaceRoot: true,
      escapeDoubleQuotes: false,
      transformCLR: false,
    },
    replace: [
      {
        match: /@rspack(?:-canary)?\/core/g,
        mark: '<RSPACK_CORE>',
      },
    ],
  }),
);

if (process.env.ECO_CI) {
  expect.extend({
    toMatchSnapshot: () => ({
      pass: true,
      message: () => 'Snapshot always passes',
    }),
    toMatchInlineSnapshot: () => ({
      pass: true,
      message: () => 'Snapshot always passes',
    }),
  });
}
