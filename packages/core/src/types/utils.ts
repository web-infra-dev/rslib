export type PkgJson = {
  name: string;
  type?: 'module' | 'commonjs';
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

export type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
}>;

export type ExcludesFalse = <T>(x: T | false | undefined | null) => x is T;
