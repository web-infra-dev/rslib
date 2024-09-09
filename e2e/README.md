# Modern.js Module tests coverage

Rslib will try to cover the common scenarios in the [integration test cases of Modern.js Module](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module). This document is used to record the coverage situation. The supported types are divided into three types: "fully supported", "Partial supported", "not supported, but planned to support" and "not supported, not planned to support".

## build

| Supported | Partial supported | Will support | Will not support |
| --------- | ----------------- | ------------ | ---------------- |
| 🟢        | 🟡                | ⚪️           | ⚫️              |

| Feature         | Status | Note                                                                                                 |
| --------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| alias           | 🟢     |                                                                                                      |
| asset           | ⚪️     |                                                                                                      |
| autoExtension   | 🟢     |                                                                                                      |
| autoExternal    | 🟢     |                                                                                                      |
| banner-footer   | 🟢     |                                                                                                      |
| buildType       | 🟢     |                                                                                                      |
| copy            | 🟢     |                                                                                                      |
| decorator       | ⚪️     |                                                                                                      |
| define          | 🟢     |                                                                                                      |
| dts             | 🟢     |                                                                                                      |
| dts-composite   | ⚪️     |                                                                                                      |
| esbuildOptions  | ⚫️    |                                                                                                      |
| externals       | 🟢     |                                                                                                      |
| format          | 🟡     | Support `cjs` and `esm`, `umd` still need to be tested                                               |
| input           | 🟢     |                                                                                                      |
| jsx             | ⚪️     |                                                                                                      |
| metafile        | ⚪️     |                                                                                                      |
| minify          | 🟢     |                                                                                                      |
| platform        | 🟢     |                                                                                                      |
| redirect        | ⚪️     |                                                                                                      |
| resolve         | 🟢     |                                                                                                      |
| shims           | 🟡     | Support shims `__filename` and `__dirname` in esm</br> `import.meta.url` in cjs need to be supported |
| sideEffects     | ⚪️     |                                                                                                      |
| sourceDir       | ⚪️     |                                                                                                      |
| sourceMap       | 🟢     |                                                                                                      |
| splitting       | ⚪️     |                                                                                                      |
| style           | ⚪️     |                                                                                                      |
| target          | 🟢     |                                                                                                      |
| transformImport | 🟢     |                                                                                                      |
| transformLodash | 🟢     |                                                                                                      |
| tsconfig        | ⚪️     |                                                                                                      |
| tsconfigExtends | ⚪️     |                                                                                                      |
| umdGlobals      | ⚪️     |                                                                                                      |
| umdModuleName   | ⚪️     |                                                                                                      |
