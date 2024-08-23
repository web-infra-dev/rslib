/**
 * The following code is modified based on
 * https://github.com/sindresorhus/type-fest/blob/986fab/source/package-json.d.ts
 *
 * MIT OR CC0-1.0 Licensed
 * https://github.com/sindresorhus/type-fest/blob/main/license-cc0
 */

/**
 * Matches a JSON object.
 *
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.
 *
 * @category JSON
 */
type JsonObject = { [Key in string]: JsonValue } & {
  [Key in string]?: JsonValue | undefined;
};

/**
 * Matches a JSON array.
 *
 * @category JSON
 */
type JsonArray = JsonValue[] | readonly JsonValue[];

/**
 * Matches any valid JSON primitive value.
 *
 * @category JSON
 */
type JsonPrimitive = string | number | boolean | null;

/**
 * Matches any valid JSON value.
 *
 * @category JSON
 */
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

type Scripts = Partial<Record<string, string>>;

type Dependency = Partial<Record<string, string>>;

/**
 * A mapping of conditions and the paths to which they resolve.
 */
type ExportConditions = {
  // eslint-disable-line @typescript-eslint/consistent-indexed-object-style
  [condition: string]: Exports;
};

/**
 * Entry points of a module, optionally with conditions and subpath exports.
 */
type Exports =
  | null
  | string
  | Array<string | ExportConditions>
  | ExportConditions;

/**
 * Import map entries of a module, optionally with conditions and subpath imports.
 */
type Imports = {
  [key: `#${string}`]: Exports;
};

interface NonStandardEntryPoints {
  /**
		An ECMAScript module ID that is the primary entry point to the program.
		*/
  module?: string;

  /**
		Denote which files in your project are "pure" and therefore safe for Webpack to prune if unused.

		[Read more.](https://webpack.js.org/guides/tree-shaking/)
		*/
  sideEffects?: boolean | string[];
}

/**
 * Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). Containing standard npm properties.
 */
interface PackageJsonStandard {
  /**
		The name of the package.
		*/
  name?: string;

  /**
		Package version, parseable by [`node-semver`](https://github.com/npm/node-semver).
		*/
  version?: string;

  /**
		Package description, listed in `npm search`.
		*/
  description?: string;

  /**
		Keywords associated with package, listed in `npm search`.
		*/
  keywords?: string[];

  /**
		The licenses for the package.
		*/
  licenses?: Array<{
    type?: string;
    url?: string;
  }>;

  /**
		The files included in the package.
		*/
  files?: string[];

  /**
		Resolution algorithm for importing ".js" files from the package's scope.

		[Read more.](https://nodejs.org/api/esm.html#esm_package_json_type_field)
		*/
  type?: 'module' | 'commonjs';

  /**
		The module ID that is the primary entry point to the program.
		*/
  main?: string;

  /**
		Subpath exports to define entry points of the package.

		[Read more.](https://nodejs.org/api/packages.html#subpath-exports)
		*/
  exports?: Exports;

  /**
		Subpath imports to define internal package import maps that only apply to import specifiers from within the package itself.

		[Read more.](https://nodejs.org/api/packages.html#subpath-imports)
		*/
  imports?: Imports;

  /**
		The executable files that should be installed into the `PATH`.
		*/
  bin?: string | Partial<Record<string, string>>;

  /**
		Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point.
		*/
  scripts?: Scripts;

  /**
		Is used to set configuration parameters used in package scripts that persist across upgrades.
		*/
  config?: JsonObject;

  /**
		The dependencies of the package.
		*/
  dependencies?: Dependency;

  /**
		Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling.
		*/
  devDependencies?: Dependency;

  /**
		Dependencies that will usually be required by the package user directly or via another dependency.
		*/
  peerDependencies?: Dependency;

  /**
		Engines that this package runs on.
		*/
  engines?: {
    [EngineName in 'npm' | 'node' | string]?: string;
  };

  /**
		@deprecated
		*/
  engineStrict?: boolean;

  /**
		If set to `true`, a warning will be shown if package is installed locally. Useful if the package is primarily a command-line application that should be installed globally.

		@deprecated
		*/
  preferGlobal?: boolean;

  /**
		If set to `true`, then npm will refuse to publish it.
		*/
  private?: boolean;

  /**
		A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default.
		*/
  publishConfig?: PublishConfig;
}

type PublishConfig = {
  /**
		Additional, less common properties from the [npm docs on `publishConfig`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig).
		*/
  [additionalProperties: string]: JsonValue | undefined;

  /**
		When publishing scoped packages, the access level defaults to restricted. If you want your scoped package to be publicly viewable (and installable) set `--access=public`. The only valid values for access are public and restricted. Unscoped packages always have an access level of public.
		*/
  access?: 'public' | 'restricted';

  /**
		The base URL of the npm registry.

		Default: `'https://registry.npmjs.org/'`
		*/
  registry?: string;

  /**
		The tag to publish the package under.

		Default: `'latest'`
		*/
  tag?: string;
};

/**
 * Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). Also includes types for fields used by other popular projects, like TypeScript and Yarn.
 *
 * @category File
 */
export type PackageJson = JsonObject &
  PackageJsonStandard &
  NonStandardEntryPoints;
