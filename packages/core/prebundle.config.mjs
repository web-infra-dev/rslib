// @ts-check
import { join } from 'node:path';
import fs from 'fs-extra';

/**
 * Tip: please add the prebundled packages to `tsconfig.json#paths`.
 */

/** @type {import('prebundle').Config} */
export default {
  externals: {
    typescript: 'typescript',
  },
  dependencies: [
    'commander',
    {
      name: 'picocolors',
      beforeBundle({ depPath }) {
        const typesFile = join(depPath, 'types.ts');
        // Fix type bundle
        if (fs.existsSync(typesFile)) {
          fs.renameSync(typesFile, join(depPath, 'types.d.ts'));
        }
      },
    },
  ],
};
