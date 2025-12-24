import util from 'node:util';
import {
  createRsbuild,
  type EnvironmentConfig,
  type LoadEnvResult,
  loadEnv,
  type RsbuildInstance,
  type RsbuildPlugin,
} from '@rsbuild/core';
import { composeRsbuildEnvironments, pruneEnvironments } from './config';
import { onBeforeRestart } from './restart';
import type { RslibConfig } from './types';
import type {
  BuildOptions,
  BuildResult,
  CreateRslibOptions,
  InspectConfigOptions,
  InspectConfigResult,
  InternalContext,
  OnAfterCreateRsbuildFn,
  RslibInstance,
  StartMFDevServerOptions,
  StartServerResult,
} from './types/rslib';
import {
  ensureAbsolutePath,
  getNodeEnv,
  isFunction,
  setNodeEnv,
} from './utils/helper';
import { isDebug, isDebugKey, logger } from './utils/logger';

const applyDebugInspectConfigPlugin = (
  rsbuildInstance: RsbuildInstance,
  config: RslibConfig,
): void => {
  // write Rslib / Rsbuild / Rspack config to disk in debug mode
  if (!isDebugKey(['rslib'])) {
    return;
  }

  const inspect = async () => {
    await rsbuildInstance.inspectConfig({
      verbose: true,
      writeToDisk: true,
      extraConfigs: {
        rslib: config,
      },
    });
  };

  const debugRslibPlugin: RsbuildPlugin = {
    name: 'rsbuild:debug-rslib',
    setup(api) {
      api.onBeforeBuild(async ({ isFirstCompile }) => {
        if (isFirstCompile) {
          await inspect();
        }
      });
      api.onAfterStartDevServer(() => {
        void inspect();
      });
    },
  };

  rsbuildInstance.addPlugins([debugRslibPlugin], {
    // should after cleanOutput plugin
    before: 'rsbuild:asset',
  });
};

export function createContext(
  options: CreateRslibOptions,
  config: RslibConfig,
  envs: LoadEnvResult | null,
): InternalContext {
  const cwd = options.cwd || process.cwd();
  const rootPath = config.root ? ensureAbsolutePath(cwd, config.root) : cwd;
  const envFilePaths = envs ? envs.filePaths : [];
  const watchFiles = [
    config._privateMeta?.configFilePath,
    ...envFilePaths,
  ].filter(Boolean) as string[];

  return {
    version: RSLIB_VERSION,
    rootPath,
    config,
    watchFiles,
  };
}

/**
 * Create an Rslib instance.
 */
export async function createRslib(
  options: CreateRslibOptions = {},
): Promise<RslibInstance> {
  const envs = options.loadEnv
    ? loadEnv({
        cwd: options.cwd,
        ...(typeof options.loadEnv === 'boolean' ? {} : options.loadEnv),
      })
    : null;

  const configOrFactory = options.config;
  const config = isFunction(configOrFactory)
    ? await configOrFactory()
    : configOrFactory || ({} as RslibConfig);

  if (envs) {
    // define the public environment variables
    config.source ||= {};
    config.source.define = {
      ...envs.publicVars,
      ...config.source.define,
    };
  }

  const context = createContext(options, config, envs);
  config.root = context.rootPath;

  const onAfterCreateRsbuildCallbacks: OnAfterCreateRsbuildFn[] = [];

  const onAfterCreateRsbuild = (callback: OnAfterCreateRsbuildFn): void => {
    onAfterCreateRsbuildCallbacks.push(callback);
  };

  const createRsbuildInstance = async (
    options: CreateRslibOptions,
    mode: 'development' | 'production',
    environments: Record<string, EnvironmentConfig>,
  ): Promise<RsbuildInstance> => {
    const rsbuildInstance = await createRsbuild({
      cwd: options.cwd,
      callerName: 'rslib',
      config: {
        mode,
        root: config.root,
        plugins: config.plugins,
        dev: config.dev,
        server: config.server,
        logLevel: isDebug() ? 'info' : config.logLevel,
        environments,
      },
    });

    if (envs) {
      rsbuildInstance.onCloseBuild(envs.cleanup);
      rsbuildInstance.onCloseDevServer(envs.cleanup);
    }

    applyDebugInspectConfigPlugin(rsbuildInstance, config);

    for (const callback of onAfterCreateRsbuildCallbacks) {
      await callback({ rsbuild: rsbuildInstance });
    }

    return rsbuildInstance;
  };

  const build = async (
    buildOptions: BuildOptions = {},
  ): Promise<BuildResult> => {
    context.action = 'build';

    if (!getNodeEnv()) {
      setNodeEnv('production');
    }

    if (buildOptions.watch) {
      config.plugins = config.plugins || [];
      config.plugins.push({
        name: 'rslib:on-after-build',
        setup(api) {
          api.onAfterBuild(({ isFirstCompile }) => {
            if (isFirstCompile) {
              logger.success('build complete, watching for changes...');
            }
          });
        },
      } satisfies RsbuildPlugin);
    }

    const { environments } = await composeRsbuildEnvironments(config);

    const rsbuildInstance = await createRsbuildInstance(
      options,
      'production',
      pruneEnvironments(environments, buildOptions.lib),
    );

    const buildResult = await rsbuildInstance.build({
      watch: buildOptions.watch,
    });

    context.rsbuildConfig = rsbuildInstance.getNormalizedConfig();

    return buildResult;
  };

  const inspectConfig = async (
    inspectOptions: InspectConfigOptions = {},
  ): Promise<InspectConfigResult> => {
    context.action = 'inspect';

    if (inspectOptions.mode) {
      setNodeEnv(inspectOptions.mode);
    } else if (!getNodeEnv()) {
      setNodeEnv('production');
    }

    const { environments } = await composeRsbuildEnvironments(config);

    const rsbuildInstance = await createRsbuildInstance(
      options,
      'production',
      pruneEnvironments(environments, inspectOptions.lib),
    );

    const inspectConfigResult = await rsbuildInstance.inspectConfig({
      mode: inspectOptions.mode,
      verbose: inspectOptions.verbose,
      outputPath: inspectOptions.outputPath,
      writeToDisk: inspectOptions.writeToDisk,
      extraConfigs: {
        rslib: config,
      },
    });

    context.rsbuildConfig = rsbuildInstance.getNormalizedConfig();

    const rawRslibConfig = util.inspect(config, {
      depth: null,
    });

    return {
      rslibConfig: rawRslibConfig,
      ...inspectConfigResult,
    };
  };

  const startMFDevServer = async (
    mfOptions: StartMFDevServerOptions = {},
  ): Promise<StartServerResult> => {
    context.action = 'mf-dev';

    if (!getNodeEnv()) {
      setNodeEnv('development');
    }

    const { environments, environmentWithInfos } =
      await composeRsbuildEnvironments(config);

    const selectedEnvironmentIds = environmentWithInfos
      .filter((env) => {
        const isMf = env.format === 'mf';
        if (!mfOptions.lib || mfOptions.lib.length === 0) {
          return isMf;
        }
        return env.id && mfOptions.lib.includes(env.id);
      })
      .map((env) => env.id);

    if (!selectedEnvironmentIds.length) {
      throw new Error(
        `No mf format found in ${
          mfOptions.lib && mfOptions.lib.length > 0
            ? `libs ${mfOptions.lib.map((lib) => `"${lib}"`).join(', ')}`
            : 'your config'
        }, please check your config to ensure that the mf format is enabled correctly.`,
      );
    }

    const selectedEnvironments = pruneEnvironments(
      environments,
      selectedEnvironmentIds,
    );

    const rsbuildInstance = await createRsbuildInstance(
      options,
      'development',
      selectedEnvironments,
    );

    const startDevServer = await rsbuildInstance.startDevServer();

    context.rsbuildConfig = rsbuildInstance.getNormalizedConfig();

    onBeforeRestart(startDevServer.server.close);

    return startDevServer;
  };

  const rslib: RslibInstance = {
    context,
    onAfterCreateRsbuild,
    build,
    inspectConfig,
    startMFDevServer,
  };

  return rslib;
}
