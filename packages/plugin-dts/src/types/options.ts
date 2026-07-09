export type DtsRedirect = {
  path?: boolean;
  extension?: boolean;
};

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
      };
  banner?: string;
  footer?: string;
  redirect?: DtsRedirect;
  tsgo?: boolean;
};
