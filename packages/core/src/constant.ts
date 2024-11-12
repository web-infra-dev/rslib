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
export const RSLIB_ENTRY_QUERY = '__rslib_entry__';
export const SHEBANG_PREFIX = '#!';
export const SHEBANG_REGEX: RegExp = /#!.*[\s\n\r]*/;
export const REACT_DIRECTIVE_REGEX: RegExp =
  /^['"]use (client|server)['"](;?)[\s\n\r]*$/;

export const JS_EXTENSIONS: string[] = [
  'js',
  'mjs',
  'jsx',
  'ts',
  'mts',
  'tsx',
  'cjs',
  'cjsx',
  'mjsx',
  'mtsx',
  'cts',
  'ctsx',
] as const;

export const CSS_EXTENSIONS: string[] = [
  'css',
  'sass',
  'scss',
  'less',
] as const;

export const ENTRY_EXTENSIONS: string[] = [
  ...JS_EXTENSIONS,
  ...CSS_EXTENSIONS,
] as const;

export const JS_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${JS_EXTENSIONS.join('|')})$`,
);

export const CSS_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${CSS_EXTENSIONS.join('|')})$`,
);

export const ENTRY_EXTENSIONS_PATTERN: RegExp = new RegExp(
  `\\.(${ENTRY_EXTENSIONS.join('|')})$`,
);
