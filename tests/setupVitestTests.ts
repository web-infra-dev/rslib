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
    replace: [
      {
        match: /__WEBPACK_EXTERNAL_MODULE__(\w+)__/g,
        mark: 'WEBPACK_EXTERNAL_MODULE',
      },
    ],
    features: {
      escapeDoubleQuotes: false,
      transformCLR: false,
    },
  }),
);
