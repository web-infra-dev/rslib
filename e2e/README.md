# Modern.js Module tests coverage

Rslib will try to cover the common scenarios in the [integration test cases of Modern.js Module](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module). This document is used to record the coverage situation. The supported types are divided into three types: "fully supported", "Partial supported", "not supported, but planned to support" and "not supported, not planned to support".

## build

| Supported | Partial supported | Will support | Will not support |
| --------- | ----------------- | ------------ | ---------------- |
| 🟢        | 🟡                | ⚪️           | ⚫️              |

| Feature         | Status | Note                                                                                                                    |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| alias           | 🟢     |                                                                                                                         |
| asset           | ⚪️     |                                                                                                                         |
| autoExtension   | 🟡     | Support js extension, dts extension need to be supported in the future                                                  |
| autoExternal    | ⚪️     |                                                                                                                         |
| banner-footer   | ⚪️     |                                                                                                                         |
| buildType       | ⚪️     |                                                                                                                         |
| copy            | ⚪️     |                                                                                                                         |
| decorator       | ⚪️     |                                                                                                                         |
| define          | 🟢     |                                                                                                                         |
| dts             | ⚪️     |                                                                                                                         |
| dts-composite   | ⚪️     |                                                                                                                         |
| esbuildOptions  | ⚪️     |                                                                                                                         |
| externals       | 🟡     | Support auto externalize Node.js built-in modules.<br />Should also support auto externalize `devDep && !peerDep` deps. |
| format          | ⚪️     |                                                                                                                         |
| input           | ⚪️     |                                                                                                                         |
| jsx             | ⚪️     |                                                                                                                         |
| metafile        | ⚪️     |                                                                                                                         |
| minify          | ⚪️     |                                                                                                                         |
| platform        | 🟢     |                                                                                                                         |
| redirect        | ⚪️     |                                                                                                                         |
| resolve         | ⚪️     |                                                                                                                         |
| shims           | ⚪️     |                                                                                                                         |
| sideEffects     | ⚪️     |                                                                                                                         |
| sourceDir       | ⚪️     |                                                                                                                         |
| sourceMap       | ⚪️     |                                                                                                                         |
| splitting       | ⚪️     |                                                                                                                         |
| style           | ⚪️     |                                                                                                                         |
| target          | 🟢     |                                                                                                                         |
| transformImport | ⚪️     |                                                                                                                         |
| transformLodash | ⚪️     |                                                                                                                         |
| tsconfig        | ⚪️     |                                                                                                                         |
| tsconfigExtends | ⚪️     |                                                                                                                         |
| umdGlobals      | ⚪️     |                                                                                                                         |
| umdModuleName   | ⚪️     |                                                                                                                         |
