/**
 * The following code is modified based on
 * https://github.com/web-infra-dev/rspack/blob/0a89e433a9f8596a7c6c4326542f168b5982d2da/packages/rspack/src/builtin-plugin/css-extract/loader.ts
 * 1. remove hmr/webpack runtime
 * 2. add `this.emitFile` to emit css files
 * 3. add `import './[name].css';` to js module
 */
import path, { extname } from 'node:path';
import type { Rspack } from '@rsbuild/core';

export const BASE_URI = "webpack://";
export const MODULE_TYPE = "css/mini-extract";
export const AUTO_PUBLIC_PATH = "__mini_css_extract_plugin_public_path_auto__";
export const ABSOLUTE_PUBLIC_PATH: string = `${BASE_URI}/mini-css-extract-plugin/`;
export const SINGLE_DOT_PATH_SEGMENT =
	"__mini_css_extract_plugin_single_dot_path_segment__";

interface DependencyDescription {
  identifier: string;
  content: string;
  context: string;
  media?: string;
  supports?: string;
  layer?: string;
  sourceMap?: string;
  identifierIndex: number;
  filepath: string;
}

// https://github.com/web-infra-dev/rspack/blob/c0986d39b7d647682f10fcef5bbade39fd016eca/packages/rspack/src/config/types.ts#L10
type Filename =
	| string
	| ((pathData: any, assetInfo?: any) => string);

export interface CssExtractRspackLoaderOptions {
  publicPath?: string | ((resourcePath: string, context: string) => string);
  emit?: boolean;
  esModule?: boolean;
  layer?: string;
  defaultExport?: boolean;

  rootDir?: string;
}

const LOADER_NAME = 'LIB_CSS_EXTRACT_LOADER';

function stringifyLocal(value: any) {
  return typeof value === 'function' ? value.toString() : JSON.stringify(value);
}

const loader: Rspack.LoaderDefinition = function loader(content) {
  if (
    this._compiler?.options?.experiments?.css &&
    this._module &&
    (this._module.type === 'css' ||
      this._module.type === 'css/auto' ||
      this._module.type === 'css/global' ||
      this._module.type === 'css/module')
  ) {
    return content;
  }
  return;
};

export const pitch: Rspack.LoaderDefinition['pitch'] = function (
  request,
  _,
  _data,
) {
  if (
    this._compiler?.options?.experiments?.css &&
    this._module &&
    (this._module.type === 'css' ||
      this._module.type === 'css/auto' ||
      this._module.type === 'css/global' ||
      this._module.type === 'css/module')
  ) {
    const e = new Error(
      `use type 'css' and \`CssExtractRspackPlugin\` together, please set \`experiments.css\` to \`false\` or set \`{ type: "javascript/auto" }\` for rules with \`CssExtractRspackPlugin\` in your rspack config (now \`CssExtractRspackPlugin\` does nothing).`,
    );
    e.stack = undefined;
    this.emitWarning(e);

    return;
  }

  const options = this.getOptions() as CssExtractRspackLoaderOptions;
  const emit = typeof options.emit !== 'undefined' ? options.emit : true;
  const callback = this.async();
  const filepath = this.resourcePath;
  const rootDir = options.rootDir ?? this.rootContext;

  let { publicPath } = this._compilation!.outputOptions;


	if (typeof options.publicPath === "string") {
		// eslint-disable-next-line prefer-destructuring
		publicPath = options.publicPath;
	} else if (typeof options.publicPath === "function") {
		publicPath = options.publicPath(this.resourcePath, this.rootContext);
	}

	if (publicPath === "auto") {
		publicPath = AUTO_PUBLIC_PATH;
	}

	let publicPathForExtract: Filename | undefined;

	if (typeof publicPath === "string") {
		const isAbsolutePublicPath = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(publicPath);

		publicPathForExtract = isAbsolutePublicPath
			? publicPath
			: `${ABSOLUTE_PUBLIC_PATH}${publicPath.replace(
					/\./g,
					SINGLE_DOT_PATH_SEGMENT
				)}`;
	} else {
		publicPathForExtract = publicPath;
	}

  const handleExports = (
    originalExports:
      | { default: Record<string, any>; __esModule: true }
      | Record<string, any>,
  ) => {
    let locals: Record<string, string> | undefined;
    let namedExport: boolean;

    const esModule =
      typeof options.esModule !== 'undefined' ? options.esModule : true;
    let dependencies: DependencyDescription[] = [];

    try {
      // eslint-disable-next-line no-underscore-dangle
      const exports = originalExports.__esModule
        ? originalExports.default
        : originalExports;

      namedExport =
        // eslint-disable-next-line no-underscore-dangle
        originalExports.__esModule &&
        (!originalExports.default || !('locals' in originalExports.default));

      if (namedExport) {
        for (const key of Object.keys(originalExports)) {
          if (key !== 'default') {
            if (!locals) {
              locals = {};
            }

            locals[key] = (originalExports as Record<string, string>)[key]!;
          }
        }
      } else {
        locals = exports?.locals;
      }

      if (Array.isArray(exports) && emit) {
        const identifierCountMap = new Map();

        dependencies = exports
          .map(([id, content, media, sourceMap, supports, layer]) => {
            const identifier = id;
            const context = this.rootContext;

            const count = identifierCountMap.get(identifier) || 0;

            identifierCountMap.set(identifier, count + 1);

            return {
              identifier,
              context,
              content,
              media,
              supports,
              layer,
              identifierIndex: count,
              sourceMap: sourceMap
                ? JSON.stringify(sourceMap)
                : // eslint-disable-next-line no-undefined
                  undefined,
              filepath,
            };
          })
          .filter((item) => item !== null) as DependencyDescription[];
      }
    } catch (e) {
      callback(e as Error);

      return;
    }

    const result = (function makeResult() {
      if (locals) {
        if (namedExport) {
          const identifiers = Array.from(
            (function* generateIdentifiers() {
              let identifierId = 0;

              for (const key of Object.keys(locals)) {
                identifierId += 1;

                yield [`_${identifierId.toString(16)}`, key];
              }
            })(),
          );

          const localsString = identifiers
            .map(
              ([id, key]) =>
                `\nvar ${id} = ${stringifyLocal(locals![key as string])};`,
            )
            .join('');
          const exportsString = `export { ${identifiers
            .map(([id, key]) => `${id} as ${JSON.stringify(key)}`)
            .join(', ')} }`;

          const defaultExport =
            typeof options.defaultExport !== 'undefined'
              ? options.defaultExport
              : false;

          return defaultExport
            ? `${localsString}\n${exportsString}\nexport default { ${identifiers
                .map(([id, key]) => `${JSON.stringify(key)}: ${id}`)
                .join(', ')} }\n`
            : `${localsString}\n${exportsString}\n`;
        }

        return `\n${
          esModule ? 'export default' : 'module.exports = '
        } ${JSON.stringify(locals)};`;
      }
      if (esModule) {
        return '\nexport {};';
      }
      return '';
    })();

    let resultSource = `// extracted by ${LOADER_NAME}`;

    let importCssFiles = '';

    function getRelativePath(from: string, to: string) {
      let relativePath = path.relative(from, to);

      if (
        !relativePath.startsWith('./') &&
        !relativePath.startsWith('../') &&
        !path.isAbsolute(relativePath)
      ) {
        relativePath = `./${relativePath}`;
      }

      return relativePath;
    }

    const m = new Map<string, string>();

    for (const { content, filepath } of dependencies) {
      let distFilepath = getRelativePath(rootDir, filepath);
      const ext = extname(distFilepath);
      if (ext !== 'css') {
        distFilepath = distFilepath.replace(ext, '.css');
      }
      distFilepath = distFilepath.replace(/\.module\.css/, '_module.css');

      const cssFilename = path.basename(distFilepath);
      if (content.trim()) {
        m.get(distFilepath)
          ? m.set(distFilepath, `${m.get(distFilepath) + content}\n`)
          : m.set(distFilepath, `${content}\n`);

        importCssFiles += '\n';
        importCssFiles += `import "./${cssFilename}"`;
      }
    }
    for (const [distFilepath, content] of m.entries()) {
      this.emitFile(distFilepath, content);
    }

    resultSource += importCssFiles;

    resultSource += result;

    callback(null, resultSource, undefined);
  };

  this.importModule(
    `${this.resourcePath}.webpack[javascript/auto]!=!!!${request}`,
    {
      layer: options.layer,
      publicPath: publicPathForExtract,
      baseUri: `${BASE_URI}/`,
    },
    (error, exports) => {
      if (error) {
        callback(error);

        return;
      }

      handleExports(exports);
    },
  );
};

export default loader;
