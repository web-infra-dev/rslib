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
    'tinyglobby',
    {
      name: 'chokidar',
      // strip sourcemap comment
      prettier: true,
    },
    {
      name: 'rslog',
      afterBundle(task) {
        // use the cjs bundle of rslog
        fs.copyFileSync(
          join(task.depPath, 'dist/index.cjs'),
          join(task.distPath, 'index.js'),
        );
      },
    },
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
