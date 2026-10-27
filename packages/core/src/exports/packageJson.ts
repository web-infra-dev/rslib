/**
 * Stringify package.json content with the indentation, line endings, and
 * trailing newline of the original text.
 */
export function stringifyPackageJson(
  content: unknown,
  originalText: string,
): string {
  const indent = /^([ \t]+)\S/m.exec(originalText)?.[1] ?? 2;
  const eol = originalText.includes('\r\n') ? '\r\n' : '\n';

  let text = JSON.stringify(content, null, indent);
  if (eol !== '\n') {
    text = text.replaceAll('\n', eol);
  }
  if (originalText.endsWith('\n')) {
    text += eol;
  }
  return text;
}
