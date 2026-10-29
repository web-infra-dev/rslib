import path from 'node:path';
import picomatch from 'picomatch';
import type {
  ExportsField,
  ExportsOptions,
  ExportsValue,
  RequireKey,
  RsbuildConfigWithLibInfo,
} from '../types';
import { normalizeSlash } from '../utils/helper';
import { logger } from '../utils/logger';
import type { DeclarationFile } from './dts';

/**
 * Paths are relative to the package root, or absolute for different Windows
 * drives, using forward slashes.
 */
export type CollectedOutput = {
  file: string;
  /** Path relative to the output directory, matched by `include` and `exclude`. */
  name: string;
};

export type CollectedEntry = {
  entryName: string;
  /**
   * The JavaScript output, absent for entries whose modules are all CSS files,
   * as their JavaScript output is empty.
   */
  js?: CollectedOutput;
  /** The CSS output, only collected in bundle mode. */
  css?: CollectedOutput;
  /** The declaration file of `js`, only collected for libs that emit declaration files. */
  declaration?: DeclarationFile;
  /** The modules of the entry. */
  sourceFiles: string[];
};

type LibInfo = RequireKey<RsbuildConfigWithLibInfo, 'id'>;

export type GenerateExportsOptions = {
  libInfos: LibInfo[];
  collected: Map<string, CollectedEntry[]>;
  options: Pick<ExportsOptions, 'include' | 'exclude' | 'source'>;
};

export type GeneratedExports = {
  exports: ExportsField;
  /** The exports of the build outputs when `source` is `true`. */
  publishExports?: ExportsField;
};

type Format = 'esm' | 'cjs';

type PreparedLib = {
  id: string;
  format: Format;
  dts: boolean;
  /** Whether declaration errors fail the build, see `dts.abortOnError`. */
  abortOnError: boolean;
  entries: CollectedEntry[];
};

type FormatSlot = {
  libId: string;
  target: string;
  declaration?: DeclarationFile;
  sourceFiles: string[];
};

type EntrySlots = Partial<Record<Format, FormatSlot>> & {
  css?: { format: Format; target: string; subpath: string };
};

// Extensions of the outputs that `include` and `exclude` match without them.
const OUTPUT_EXTENSION = /\.(?:js|mjs|cjs|css)$/;

/**
 * Match an output path relative to the output directory, either as it is or
 * without its extension.
 */
function createOutputMatcher(patterns: string[]): (name: string) => boolean {
  const isMatch = picomatch(patterns);
  return (name) => isMatch(name) || isMatch(name.replace(OUTPUT_EXTENSION, ''));
}

/** Normalize entry names such as `./foo` to `foo` before matching and naming. */
function normalizeEntryName(entryName: string): string {
  return normalizeSlash(entryName).replace(/^(\.\/)+/, '');
}

function isOutsidePackageRoot(filePath: string): boolean {
  return path.isAbsolute(filePath) || filePath.startsWith('../');
}

function getJsSubpath(entryName: string): string {
  if (entryName === 'index') return '.';
  return `./${entryName.replace(/\/index$/, '')}`;
}

function getFormatSlots(slots: EntrySlots): FormatSlot[] {
  return [slots.esm, slots.cjs].filter(
    (slot): slot is FormatSlot => slot !== undefined,
  );
}

/**
 * Build the value of a JavaScript subpath. A `types` condition is only added
 * when TypeScript cannot resolve a declaration file with the matching extension
 * next to every output, and then all formats share one declaration file.
 */
function buildJsValue(slots: EntrySlots): string | Record<string, string> {
  const formatSlots = getFormatSlots(slots);
  const value = (types?: string): string | Record<string, string> => {
    if (slots.esm && slots.cjs) {
      return {
        ...(types ? { types } : {}),
        import: slots.esm.target,
        require: slots.cjs.target,
      };
    }
    const target = formatSlots[0]!.target;
    return types ? { types, default: target } : target;
  };

  // Declaration files are only collected for libs that emit them.
  const declarations = formatSlots.map((slot) => slot.declaration);
  if (declarations.every((declaration) => declaration?.matched)) {
    return value();
  }

  // Prefer the declaration file whose module format matches its own output.
  // Outputs from non-TypeScript sources, such as assets, have no declaration file.
  const declaration =
    declarations.find((declaration) => declaration?.matched) ??
    declarations.find((declaration) => declaration !== undefined);
  return value(declaration && `./${declaration.file}`);
}

function getSourceFile(subpath: string, slots: EntrySlots): string {
  const sourceFiles = new Set<string>();
  for (const slot of getFormatSlots(slots)) {
    if (slot.sourceFiles.length !== 1) {
      throw new Error(
        `Failed to generate the "exports" field because the "${subpath}" subpath of the "${slot.libId}" lib is built from ${slot.sourceFiles.length} modules, while "exports.source" requires an entry with a single module.`,
      );
    }
    const sourceFile = slot.sourceFiles[0]!;
    if (isOutsidePackageRoot(sourceFile)) {
      throw new Error(
        `Failed to generate the "exports" field because the source file "${sourceFile}" of the "${subpath}" subpath is outside the package root.`,
      );
    }
    sourceFiles.add(`./${sourceFile}`);
  }
  if (sourceFiles.size > 1) {
    throw new Error(
      `Failed to generate the "exports" field because the "${subpath}" subpath has different source files in different formats: ${[
        ...sourceFiles,
      ]
        .map((file) => `"${file}"`)
        .join(', ')}.`,
    );
  }
  return [...sourceFiles][0]!;
}

function addSourceCondition(
  value: string | Record<string, string>,
  condition: string,
  sourceFile: string,
): Record<string, string> {
  return typeof value === 'string'
    ? { [condition]: sourceFile, default: value }
    : { [condition]: sourceFile, ...value };
}

function sortSubpaths(
  entries: [string, ExportsValue][],
): [string, ExportsValue][] {
  // Keep the main subpath first, then sort the rest by code units, as
  // locale-aware comparison may differ between machines.
  return entries.sort(([a], [b]) => {
    if (a === '.') return -1;
    if (b === '.') return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

export function generateExports({
  libInfos,
  collected,
  options,
}: GenerateExportsOptions): GeneratedExports {
  const exclude = createOutputMatcher(options.exclude ?? []);

  const preparedLibs = libInfos.flatMap(
    ({ id, format, dts, bundle }): PreparedLib[] => {
      // Other formats, such as UMD, are not referenced by the `exports` field.
      if (format !== 'esm' && format !== 'cjs') return [];
      const include = options.include && createOutputMatcher(options.include);
      // Outputs are selected one by one, so an entry can export its JavaScript
      // without its CSS. In bundleless mode, every source file is an entry, so
      // only the main entry is treated as public API by default.
      const isSelected = (entryName: string, name: string) =>
        (include ? include(name) : bundle !== false || entryName === 'index') &&
        !exclude(name);
      const entries = collected.get(id)!.flatMap((collectedEntry) => {
        const entryName = normalizeEntryName(collectedEntry.entryName);
        const { js, css } = collectedEntry;
        const hasJs = js !== undefined && isSelected(entryName, js.name);
        const hasCss = css !== undefined && isSelected(entryName, css.name);
        if (!hasJs && !hasCss) return [];
        return [
          {
            ...collectedEntry,
            entryName,
            js: hasJs ? js : undefined,
            declaration: hasJs ? collectedEntry.declaration : undefined,
            css: hasCss ? css : undefined,
          },
        ];
      });
      return [
        {
          id,
          format,
          dts: Boolean(dts),
          abortOnError: typeof dts !== 'object' || dts.abortOnError !== false,
          entries,
        },
      ];
    },
  );

  const libsWithoutDeclarations = preparedLibs.filter((lib) => {
    const jsEntries = lib.entries.filter((entry) => entry.js);
    return (
      lib.dts &&
      jsEntries.length > 0 &&
      jsEntries.every((entry) => !entry.declaration)
    );
  });
  // With `abortOnError: false`, declaration generation may fail without failing
  // the build, so the exports are generated without `types` instead.
  const skippedLibs = libsWithoutDeclarations
    .filter((lib) => !lib.abortOnError)
    .map((lib) => `"${lib.id}"`);
  if (skippedLibs.length > 0) {
    logger.warn(
      `No declaration files were found for the outputs of the following libs, so no "types" condition is generated for them: ${skippedLibs.join(', ')}.`,
    );
  }
  const failedLibs = libsWithoutDeclarations
    .filter((lib) => lib.abortOnError)
    .map((lib) => `"${lib.id}"`);
  if (failedLibs.length > 0) {
    throw new Error(
      [
        `Failed to generate the "exports" field because no declaration files were found for the outputs of the following libs that emit declaration files: ${failedLibs.join(', ')}.`,
        'Emit declaration files next to the JavaScript outputs or to "dts.distPath", and check the "declarationDir" and "rootDir" options in tsconfig.',
      ].join('\n'),
    );
  }

  const entrySlotsByName = new Map<string, EntrySlots>();
  for (const lib of preparedLibs) {
    for (const entry of lib.entries) {
      const { entryName } = entry;
      for (const file of [entry.js?.file, entry.css?.file]) {
        if (file && isOutsidePackageRoot(file)) {
          throw new Error(
            `Failed to generate the "exports" field because the "${entryName}" entry of the "${lib.id}" lib emits "${file}", which is outside the package root.`,
          );
        }
      }

      const slots = entrySlotsByName.get(entryName) ?? {};
      if (entry.js) {
        const target = `./${entry.js.file}`;
        const existingTarget = slots[lib.format]?.target;
        if (existingTarget && existingTarget !== target) {
          throw new Error(
            `Failed to generate the "exports" field because the "${entryName}" entry has multiple "${lib.format}" outputs: "${existingTarget}" and "${target}".`,
          );
        }
        slots[lib.format] = {
          libId: lib.id,
          target,
          declaration: entry.declaration,
          sourceFiles: entry.sourceFiles,
        };
      }
      if (entry.css) {
        const target = `./${entry.css.file}`;
        // ESM and CJS outputs share the same styles, prefer the ESM one.
        if (
          !slots.css ||
          (slots.css.format === 'cjs' && lib.format === 'esm')
        ) {
          slots.css = {
            format: lib.format,
            target,
            subpath: `./${entry.css.name}`,
          };
        } else if (
          slots.css.format === lib.format &&
          slots.css.target !== target
        ) {
          throw new Error(
            `Failed to generate the "exports" field because the "${entryName}" entry has multiple "${lib.format}" CSS outputs: "${slots.css.target}" and "${target}".`,
          );
        }
      }
      entrySlotsByName.set(entryName, slots);
    }
  }

  const jsSubpaths: [string, EntrySlots][] = [];
  const cssSubpaths: [string, string][] = [];
  const entryNameBySubpath = new Map<string, string>();
  const addSubpath = (subpath: string, entryName: string) => {
    const existing = entryNameBySubpath.get(subpath);
    if (existing !== undefined) {
      throw new Error(
        `Failed to generate the "exports" field because the "${existing}" and "${entryName}" entries are both exported as the "${subpath}" subpath.`,
      );
    }
    entryNameBySubpath.set(subpath, entryName);
  };
  for (const [entryName, slots] of entrySlotsByName) {
    if (getFormatSlots(slots).length > 0) {
      const subpath = getJsSubpath(entryName);
      addSubpath(subpath, entryName);
      jsSubpaths.push([subpath, slots]);
    }
    if (slots.css) {
      addSubpath(slots.css.subpath, entryName);
      cssSubpaths.push([slots.css.subpath, slots.css.target]);
    }
  }
  if (entryNameBySubpath.size === 0) {
    throw new Error(
      'Failed to generate the "exports" field because no entries can be exported. Only outputs of the "esm" and "cjs" formats that match "exports.include" and do not match "exports.exclude" are exported, and only the "index" entry is included by default in bundleless mode.',
    );
  }

  const buildExports = (
    jsValue: (subpath: string, slots: EntrySlots) => ExportsValue,
    withCss: boolean,
  ): ExportsField =>
    Object.fromEntries(
      sortSubpaths([
        ...jsSubpaths.map(([subpath, slots]): [string, ExportsValue] => [
          subpath,
          jsValue(subpath, slots),
        ]),
        ...(withCss ? cssSubpaths : []),
      ]),
    );

  const { source } = options;
  const outputExports = buildExports((_, slots) => buildJsValue(slots), true);
  if (source === true) {
    // Source files import their own styles, so only JavaScript subpaths point
    // to source files, and the outputs are published instead.
    return {
      exports: buildExports(getSourceFile, false),
      publishExports: outputExports,
    };
  }
  if (typeof source === 'string') {
    return {
      exports: buildExports(
        (subpath, slots) =>
          addSourceCondition(
            buildJsValue(slots),
            source,
            getSourceFile(subpath, slots),
          ),
        true,
      ),
    };
  }
  return { exports: outputExports };
}
