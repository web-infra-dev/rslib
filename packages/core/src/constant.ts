export const DEFAULT_CONFIG_NAME = 'rslib.config';

export const DEFAULT_CONFIG_EXTENSIONS = [
  '.js',
  '.ts',
  '.mjs',
  '.mts',
  '.cjs',
  '.cts',
] as const;

export const SWC_HELPERS = '@swc/helpers';
export const SHEBANG_PREFIX = '#!';
export const SHEBANG_REGEX: RegExp = /#!.*[\s\n\r]*$/;
export const REACT_DIRECTIVE_REGEX: RegExp =
  /^['"]use (client|server)['"](;?)[\s\n\r]*$/;

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
