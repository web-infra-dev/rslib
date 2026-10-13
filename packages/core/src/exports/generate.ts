import path from 'node:path';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../types';
import { normalizeSlash } from '../utils/helper';
import { logger } from '../utils/logger';
import { type DeclarationFile, formatMissingDeclarations } from './dts';

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

function prepareLib(
  libInfo: LibInfo,
  entries: CollectedEntry[],
): PreparedLib | undefined {
  const format = libInfo.format;
  if (format !== 'esm' && format !== 'cjs') {
    logger.warn(
      `Skip generating the "exports" field for the "${libInfo.id}" environment because the "${format}" format is not supported.`,
    );
    return;
  }
  const normalizedEntries = entries.map((entry) => ({
    ...entry,
    entryName: normalizeEntryName(entry.entryName),
  }));
  return {
    id: libInfo.id,
    format,
    dts: Boolean(libInfo.dts),
    // In bundleless mode, every source file is an entry, so only the main entry
    // is treated as public API.
    entries:
      libInfo.bundle === false
        ? normalizedEntries.filter((entry) => entry.entryName === 'index')
        : normalizedEntries,
  };
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

export function generateExports(
  options: GenerateExportsOptions,
): ExportsField | undefined {
  const { libInfos, collected } = options;

  const hasJavaScriptEntries = [...collected.values()].some(
    (entries) => entries.length > 0,
  );
  if (!hasJavaScriptEntries) {
    logger.warn(
      'Skip generating the "exports" field because no JavaScript entry files were generated.',
    );
    return;
  }

  const preparedLibs: PreparedLib[] = [];
  for (const libInfo of libInfos) {
    const entries = collected.get(libInfo.id) ?? [];
    if (entries.length === 0) continue;
    const lib = prepareLib(libInfo, entries);
    if (lib) preparedLibs.push(lib);
  }

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
    throw new Error(formatMissingDeclarations(libsWithoutDeclarations));
  }

  const entrySlotsByName = new Map<string, EntrySlots>();
  for (const lib of preparedLibs) {
    for (const entry of lib.entries) {
      if (isOutsidePackageRoot(entry.jsFile)) {
        logger.warn(
          `Skip generating the "exports" field because the "${entry.entryName}" entry points to an output file outside the package root: "${entry.jsFile}".`,
        );
        return;
      }

      const { entryName } = entry;
      const slots = entrySlotsByName.get(entryName) ?? {};
      const target = `./${entry.jsFile}`;
      const existingTarget = slots[lib.format]?.target;
      if (existingTarget && existingTarget !== target) {
        logger.warn(
          `Skip generating the "exports" field because the "${entry.entryName}" entry has multiple "${lib.format}" output files: "${existingTarget}" and "${target}".`,
        );
        return;
      }
      slots[lib.format] = { target, declaration: entry.declaration };
      entrySlotsByName.set(entryName, slots);
    }
  }
  if (entrySlotsByName.size === 0) return;

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
