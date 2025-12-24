export const SWC_HELPERS = '@swc/helpers';

const DTS_EXTENSIONS: string[] = ['d.ts', 'd.mts', 'd.cts'];

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

export const DTS_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${DTS_EXTENSIONS.join('|')})$`,
);
