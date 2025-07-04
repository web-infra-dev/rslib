import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { buildAndGetResults, type FormatType } from 'test-helper';

test('transformImport with arco-design', async () => {
  const fixturePath = join(__dirname, 'arco-design');
  const { contents } = await buildAndGetResults({ fixturePath });
  const formats: FormatType[] = ['esm0', 'esm1', 'cjs0', 'cjs1'];

  for (const format of formats) {
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import es_button from "@arco-design/web-react/es/button"'
        : 'const button_namespaceObject = require("@arco-design/web-react/es/button")',
    );
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import "@arco-design/web-react/es/button/style"'
        : 'require("@arco-design/web-react/es/button/style")',
    );
  }
});

test('transformImport with lodash', async () => {
  const fixturePath = join(__dirname, 'lodash');
  const { contents } = await buildAndGetResults({ fixturePath });
  const formats: FormatType[] = ['esm0', 'esm1', 'cjs0', 'cjs1'];

  for (const format of formats) {
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import get from "lodash/get"'
        : 'const get_namespaceObject = require("lodash/get")',
    );
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import add from "lodash/fp/add"'
        : 'const add_namespaceObject = require("lodash/fp/add")',
    );
  }
});
