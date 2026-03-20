// @ts-check

/**
 * Tip: please add the prebundled packages to `tsconfig.json#paths`.
 */

/** @type {import('prebundle').Config} */
export default {
  externals: {
    typescript: 'typescript',
  },
  dependencies: ['tsconfig-paths'],
};
