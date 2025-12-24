import type {
  BuildResult,
  LoadEnvOptions,
  RsbuildConfig,
  InspectConfigResult as RsbuildInspectConfigResult,
  RsbuildInstance,
  RsbuildMode,
  StartServerResult,
} from '@rsbuild/core';
import type { RslibConfig } from './config';

export type CommonOptions = {
  /**
   * Specify the library id to run the action on.
   */
  lib?: string[];
};

export type BuildOptions = CommonOptions & {
  /**
   * Whether to watch for file changes and rebuild.
   * @default false
   */
  watch?: boolean;
};

export type InspectConfigOptions = CommonOptions & {
  /**
   * Inspect the config in the specified mode.
   * Available options: 'development' or 'production'.
   * @default 'production'
   */
  mode?: RsbuildMode;
  /**
   * Enables verbose mode to display the complete function
   * content in the configuration.
   * @default false
   */
  verbose?: boolean;
  /**
   * Specify the output path for inspection results.
   * @default 'output.distPath.root'
   */
  outputPath?: string;
  /**
   * Whether to write the inspection results to disk.
   * @default false
   */
  writeToDisk?: boolean;
};

export type StartMFDevServerOptions = CommonOptions;

export type ActionType = 'build' | 'mf-dev' | 'inspect';

/** The public context */
export type RslibContext = {
  /** The Rslib core version. */
  version: string;
  /** The root path of current project. */
  rootPath: string;
  /**
   * The current action type.
   * - build: will be set when running `rslib build` or `rslib.build()`
   * - inspect: will be set when running `rslib inspect` or `rslib.inspectConfig()`
   * - mf-dev: will be set when running `rslib mf-dev` or `rslib.startMFDevServer()`
   */
  action?: ActionType;
  /** The normalized Rslib configurations in current Rslib instance. */
  config: RslibConfig;
  /** The normalized Rsbuild config used in current Rslib instance. */
  rsbuildConfig?: RsbuildConfig;
};

/** The inner context */
export type InternalContext = RslibContext & {
  /** List of files being watched in watch mode. */
  watchFiles?: string[];
};

export type { BuildResult, StartServerResult };

export type InspectConfigResult = {
  rslibConfig: string;
} & RsbuildInspectConfigResult;

export type RslibInstance = {
  /**
   * A read-only object that provides some context information.
   */
  context: Readonly<RslibContext>;
  /**
   * Perform a production mode build. This method will generate the outputs
   * for production and emit them to the output directory.
   */
  build(options?: BuildOptions): Promise<BuildResult>;
  /**
   * Inspect and debug Rslib configurations and the internal Rsbuild and Rspack configurations of the Rslib project. It provides access to:
   * - The resolved Rslib configuration
   * - The resolved Rsbuild configuration
   * - The environment-specific Rsbuild configurations
   * - The generated Rspack configurations
   *
   * The method serializes these configurations to strings and optionally writes
   * them to disk for inspection.
   */
  inspectConfig(options?: InspectConfigOptions): Promise<InspectConfigResult>;
  /**
   * Start the local dev server for the Module Federation format. This method will:
   *
   * 1. Start a development server that serves your mf format module.
   * 2. Watch for file changes and trigger recompilation.
   */
  startMFDevServer(
    options?: StartMFDevServerOptions,
  ): Promise<StartServerResult>;
};

export type CreateRslibOptions = {
  /**
   * The root path of current project.
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Rslib configurations.
   * Passing a function to load the config asynchronously with custom logic.
   */
  config?: RslibConfig | (() => Promise<RslibConfig>);
  /**
   * Whether to call `loadEnv` to load environment variables and define them
   * as global variables via `source.define`.
   * @default false
   */
  loadEnv?: boolean | LoadEnvOptions;
  /**
   * A hook that will be called after creating the internal Rsbuild instance.
   * You can use this to access or call the properties and methods of the Rsbuild instance.
   */
  onAfterCreateRsbuild?: (params: {
    rsbuild: RsbuildInstance;
    config: RslibConfig;
  }) => void | Promise<void>;
};
