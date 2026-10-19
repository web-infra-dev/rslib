export const SWC_HELPERS = '@swc/helpers';

const JS_EXTENSIONS: string[] = [
  'js',
  'mjs',
  'jsx',
  '(?<!\\.d\\.)ts', // ignore d.ts,
  '(?<!\\.d\\.)mts', // ditto
  '(?<!\\.d\\.)cts', // ditto
  'tsx',
  'cjs',
  'cjsx',
  'mjsx',
  'mtsx',
  'ctsx',
] as const;

const CSS_EXTENSIONS: string[] = [
  'css',
  'sass',
  'scss',
  'less',
  'styl',
  'stylus',
] as const;

export const JS_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${JS_EXTENSIONS.join('|')})$`,
);

export const CSS_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${CSS_EXTENSIONS.join('|')})$`,
);

export const DTS_EXTENSIONS_PATTERN: RegExp = /\.d\.(?:[cm]?ts|[^/\\]+\.ts)$/;

/**
 * Chain ID for the `new URL()` parser rule.
 * Users can customize this rule through `tools.bundlerChain`.
 */
export const NEW_URL_RULE = 'rslib:new-url';

/**
 * Chain ID for the module rule that turns a `new URL()` target into its own
 * entry. Only applied in bundle mode when `lib.newUrl.mode` is `'entry'`.
 * Users can customize this rule through `tools.bundlerChain`.
 */
export const NEW_URL_ENTRY_RULE = 'rslib:new-url-entry';
