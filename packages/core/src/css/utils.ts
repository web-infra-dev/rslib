/**
 * This function is copied from
 * https://github.com/webpack-contrib/mini-css-extract-plugin/blob/3effaa0319bad5cc1bf0ae760553bf7abcbc35a4/src/utils.js#L169
 * linted by biome
 */
function getUndoPath(
  filename: string,
  outputPathArg: string,
  enforceRelative: boolean,
): string {
  let depth = -1;
  let append = '';

  let outputPath = outputPathArg.replace(/[\\/]$/, '');

  for (const part of filename.split(/[/\\]+/)) {
    if (part === '..') {
      if (depth > -1) {
        depth--;
      } else {
        const i = outputPath.lastIndexOf('/');
        const j = outputPath.lastIndexOf('\\');
        const pos = i < 0 ? j : j < 0 ? i : Math.max(i, j);

        if (pos < 0) {
          return `${outputPath}/`;
        }

        append = `${outputPath.slice(pos + 1)}/${append}`;

        outputPath = outputPath.slice(0, pos);
      }
    } else if (part !== '.') {
      depth++;
    }
  }

  return depth > 0
    ? `${'../'.repeat(depth)}${append}`
    : enforceRelative
      ? `./${append}`
      : append;
}

export { getUndoPath };
