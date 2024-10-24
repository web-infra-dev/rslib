export type PkgJson = {
  name: string;
  type?: 'module' | 'commonjs';
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};
