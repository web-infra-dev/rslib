// This file can only be imported by @rstest/core test files
import { expect } from '@rstest/core';
import { getFileBySuffix } from './shared';

export function expectFileContainContent(
  files: Record<string, string>,
  suffix: string,
  content: string | string[],
) {
  const fileContent = getFileBySuffix(files, suffix);

  const contents = Array.isArray(content) ? content : [content];

  for (const text of contents) {
    expect(fileContent).toContain(text);
  }
}
