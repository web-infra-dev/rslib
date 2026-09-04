import path from 'node:path';
import type { RequireKey, RsbuildConfigWithLibInfo } from '../types';
import { logger } from '../utils/logger';

export type CollectedEntry = {
  entryName: string;
  /** Path relative to the package root, or absolute for different Windows drives, using forward slashes. */
  jsFile: string;
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
  format: 'esm' | 'cjs';
  entries: CollectedEntry[];
};

type EntrySlots = {
  esm?: string;
  cjs?: string;
};

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
  return { format, entries };
}

function buildEntryValue(slots: EntrySlots): string | ExportsField | undefined {
  if (slots.esm && slots.cjs) {
    return {
      import: slots.esm,
      require: slots.cjs,
    };
  }
  return slots.esm ?? slots.cjs;
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

  const entrySlotsByName = new Map<string, EntrySlots>();
  for (const lib of preparedLibs) {
    for (const entry of lib.entries) {
      if (isOutsidePackageRoot(entry.jsFile)) {
        logger.warn(
          `Skip generating the "exports" field because the "${entry.entryName}" entry points to an output file outside the package root: "${entry.jsFile}".`,
        );
        return;
      }

      const slots = entrySlotsByName.get(entry.entryName) ?? {};
      const target = `./${entry.jsFile}`;
      const existingTarget = slots[lib.format];
      if (existingTarget && existingTarget !== target) {
        logger.warn(
          `Skip generating the "exports" field because the "${entry.entryName}" entry has multiple "${lib.format}" output files: "${existingTarget}" and "${target}".`,
        );
        return;
      }
      slots[lib.format] = target;
      entrySlotsByName.set(entry.entryName, slots);
    }
  }
  if (entrySlotsByName.size === 0) return;

  const exportsField: ExportsField = {
    './package.json': './package.json',
  };
  // Keep the main entry before other entry subpaths, then sort the rest for stable output.
  const sortedEntries = [...entrySlotsByName].sort(([a], [b]) => {
    if (a === 'index') return -1;
    if (b === 'index') return 1;
    return a.localeCompare(b);
  });
  for (const [entryName, slots] of sortedEntries) {
    const value = buildEntryValue(slots);
    if (value) {
      exportsField[entryName === 'index' ? '.' : `./${entryName}`] = value;
    }
  }
  return exportsField;
}
