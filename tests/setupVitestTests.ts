import path from 'node:path';
import process from 'node:process';
import { createSnapshotSerializer } from 'path-serializer';
import { beforeEach, expect } from 'vitest';

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
    },
  }),
);
