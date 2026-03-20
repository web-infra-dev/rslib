import type { Config } from 'prebundle';

/**
 * Tip: remember to add the prebundled packages to `tsconfig.json#paths` or `dts.alias`
 */

export default {
  externals: {
    typescript: 'typescript',
  },
  dependencies: ['tsconfig-paths'],
} satisfies Config;
