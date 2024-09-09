import { join } from 'node:path';
import { type FormatType, buildAndGetResults } from '@e2e/helper';
import { expect, test } from 'vitest';

test('transformImport with arco-design', async () => {
  const fixturePath = join(__dirname, 'arco-design');
  const { contents } = await buildAndGetResults(fixturePath);
  const formats: FormatType[] = ['esm0', 'esm1', 'cjs0', 'cjs1'];

  for (const format of formats) {
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import * as __WEBPACK_EXTERNAL_MODULE__arco_design_web_react_es_button__ from "@arco-design/web-react/es/button"'
        : 'var button_namespaceObject = require("@arco-design/web-react/es/button")',
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
  const { contents } = await buildAndGetResults(fixturePath);
  const formats: FormatType[] = ['esm0', 'esm1', 'cjs0', 'cjs1'];

  for (const format of formats) {
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import * as __WEBPACK_EXTERNAL_MODULE_lodash_get__ from "lodash/get"'
        : 'var get_namespaceObject = require("lodash/get")',
    );
    expect(Object.values(contents[format]!)[0]).toContain(
      format.startsWith('esm')
        ? 'import * as __WEBPACK_EXTERNAL_MODULE_lodash_fp_add__ from "lodash/fp/add"'
        : 'var add_namespaceObject = require("lodash/fp/add")',
    );
  }
});
