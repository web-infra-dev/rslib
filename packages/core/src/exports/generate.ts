import path from 'node:path';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../types';
import { normalizeSlash } from '../utils/helper';
import type { DeclarationFile } from './dts';

export type CollectedEntry = {
  entryName: string;
  /** Path relative to the package root, or absolute for different Windows drives, using forward slashes. */
  jsFile: string;
  /** The declaration file next to `jsFile`, only collected for libs that emit declaration files. */
  declaration?: DeclarationFile;
};

export type ExportsField = {
  [key: string]: string | ExportsField;
};

type LibInfo = RequireKey<RsbuildConfigWithLibInfo, 'id'>;

export type GenerateExportsOptions = {
  libInfos: LibInfo[];
  collected: Map<string, CollectedEntry[]>;
};

type PreparedLib = {
  id: string;
  format: 'esm' | 'cjs';
  dts: boolean;
  entries: CollectedEntry[];
};

type FormatSlot = {
  target: string;
  declaration?: DeclarationFile;
};

type EntrySlots = {
  esm?: FormatSlot;
  cjs?: FormatSlot;
};

/** Normalize entry names such as `./foo/` to `foo` before using them as subpaths. */
function normalizeEntryName(entryName: string): string {
  return normalizeSlash(entryName)
    .replace(/^(\.\/)+/, '')
    .replace(/\/+$/, '');
}

function isOutsidePackageRoot(filePath: string): boolean {
  return path.isAbsolute(filePath) || filePath.startsWith('../');
}

function getFormatSlots(slots: EntrySlots): FormatSlot[] {
  return [slots.esm, slots.cjs].filter(
    (slot): slot is FormatSlot => slot !== undefined,
  );
}

/**
 * Build the value of a subpath. A `types` condition is only added when
 * TypeScript cannot resolve a declaration file with the matching extension
 * next to every output, and then all formats share one declaration file.
 */
function buildEntryValue(slots: EntrySlots): string | ExportsField {
  const formatSlots = getFormatSlots(slots);
  const value = (types?: string): string | ExportsField => {
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

export function generateExports(options: GenerateExportsOptions): ExportsField {
  const { libInfos, collected } = options;

  const preparedLibs = libInfos.flatMap(
    ({ id, format, dts, bundle }): PreparedLib[] => {
      // Other formats, such as UMD, are not referenced by the `exports` field.
      if (format !== 'esm' && format !== 'cjs') return [];
      const entries = (collected.get(id) ?? []).map((entry) => ({
        ...entry,
        entryName: normalizeEntryName(entry.entryName),
      }));
      return [
        {
          id,
          format,
          dts: Boolean(dts),
          // In bundleless mode, every source file is an entry, so only the main
          // entry is treated as public API.
          entries:
            bundle === false
              ? entries.filter((entry) => entry.entryName === 'index')
              : entries,
        },
      ];
    },
  );

  // Declaration files emitted to a separate directory cannot be resolved from the outputs.
  const libsWithoutDeclarations = preparedLibs
    .filter(
      (lib) =>
        lib.dts &&
        lib.entries.length > 0 &&
        lib.entries.every((entry) => !entry.declaration),
    )
    .map((lib) => lib.id);
  if (libsWithoutDeclarations.length > 0) {
    throw new Error(
      [
        `Failed to generate the "exports" field because no declaration files were found next to the outputs of the following libs that emit declaration files: ${libsWithoutDeclarations.map((id) => `"${id}"`).join(', ')}.`,
        'Emit declaration files to the same directory as the JavaScript outputs, check "dts.distPath", and the "declarationDir" and "rootDir" options in tsconfig.',
      ].join('\n'),
    );
  }

  const entrySlotsByName = new Map<string, EntrySlots>();
  for (const lib of preparedLibs) {
    for (const entry of lib.entries) {
      if (isOutsidePackageRoot(entry.jsFile)) {
        throw new Error(
          `Failed to generate the "exports" field because the "${entry.entryName}" entry of the "${lib.id}" environment emits "${entry.jsFile}", which is outside the package root.`,
        );
      }

      const { entryName } = entry;
      const slots = entrySlotsByName.get(entryName) ?? {};
      const target = `./${entry.jsFile}`;
      const existingTarget = slots[lib.format]?.target;
      if (existingTarget && existingTarget !== target) {
        throw new Error(
          `Failed to generate the "exports" field because the "${entryName}" entry has multiple "${lib.format}" outputs: "${existingTarget}" and "${target}".`,
        );
      }
      slots[lib.format] = { target, declaration: entry.declaration };
      entrySlotsByName.set(entryName, slots);
    }
  }
  if (entrySlotsByName.size === 0) {
    throw new Error(
      'Failed to generate the "exports" field because no entries can be exported. Only the "esm" and "cjs" formats are supported, and only the "index" entry is exported in bundleless mode.',
    );
  }

  const exportsField: ExportsField = {};
  // Keep the main entry before other entry subpaths, then sort the rest for stable output.
  const sortedEntries = [...entrySlotsByName].sort(([a], [b]) => {
    if (a === 'index') return -1;
    if (b === 'index') return 1;
    return a.localeCompare(b);
  });
  for (const [entryName, slots] of sortedEntries) {
    exportsField[entryName === 'index' ? '.' : `./${entryName}`] =
      buildEntryValue(slots);
  }
  return exportsField;
}
