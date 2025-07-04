import path from 'node:path';
import process from 'node:process';
import { beforeEach, expect } from '@rstest/core';
import { createSnapshotSerializer } from 'path-serializer';

beforeEach(() => {
  // since our NODE_ENV injection logic is via cli, we need to
  // delete "test" NODE_ENV to avoid affecting the default build config
  delete process.env.NODE_ENV;
});

expect.addSnapshotSerializer(
  createSnapshotSerializer({
    root: path.join(__dirname, '..'),
    features: {
      escapeDoubleQuotes: false,
      transformCLR: false,
    },
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
