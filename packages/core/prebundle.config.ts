import type { Config } from 'prebundle';

/**
 * Tip: remember to add the prebundled packages to `tsconfig.json#paths` or `dts.alias`
 */

export default {
  externals: {
    typescript: 'typescript',
  },
  dependencies: [
    {
      name: 'rslog',
      dtsOnly: true,
    },
  ],
} satisfies Config;
