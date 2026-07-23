export type DtsRedirect = {
  path?: boolean;
  extension?: boolean;
};

export type AutoExternalExclude = (string | RegExp) | (string | RegExp)[];

export type ApiExtractorOptions = {
  bundledPackages?: string[];
};

export type PluginDtsOptions = {
  bundle?: boolean | ApiExtractorOptions;
  distPath?: string;
  build?: boolean;
  abortOnError?: boolean;
  dtsExtension?: string;
  alias?: Record<string, string>;
  isolated?: boolean;
  autoExternal?:
    | boolean
    | {
        dependencies?: boolean;
        optionalDependencies?: boolean;
        peerDependencies?: boolean;
        devDependencies?: boolean;
        packageJson?: string | string[];
        exclude?: AutoExternalExclude;
      };
  banner?: string;
  footer?: string;
  redirect?: DtsRedirect;
  typescriptPath?: string;
  tsgo?: boolean;
};
