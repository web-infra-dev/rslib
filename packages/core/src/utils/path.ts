/**
 * This function is modified based on
 * https://github.com/web-infra-dev/rspack/blob/7b80a45a1c58de7bc506dbb107fad6fda37d2a1f/packages/rspack/src/loader-runner/index.ts#L903
 */
const PATH_QUERY_FRAGMENT_REGEXP =
  /^((?:\u200b.|[^?#\u200b])*)(\?(?:\u200b.|[^#\u200b])*)?(#.*)?$/;

export function parsePathQueryFragment(str: string): {
  path: string;
  query: string;
  fragment: string;
} {
  const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
  return {
    path: match?.[1]?.replace(/\u200b(.)/g, '$1') || '',
    query: match?.[2] ? match[2].replace(/\u200b(.)/g, '$1') : '',
    fragment: match?.[3] || '',
  };
}

export function appendPathExtension(
  filepath: string,
  extension: string,
): string {
  const { path, query, fragment } = parsePathQueryFragment(filepath);
  return `${path}${extension}${query}${fragment}`;
}

export function replacePathExtension(
  filepath: string,
  extension: string,
): string {
  const { path, query, fragment } = parsePathQueryFragment(filepath);
  return `${path.replace(/\.[^.]+$/, extension)}${query}${fragment}`;
}
