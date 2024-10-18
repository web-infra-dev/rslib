# Modern.js Module tests coverage

Rslib will try to cover the common scenarios in the [integration test cases of Modern.js Module](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module). This document is used to record the coverage situation. The supported types are divided into three types: "fully supported", "Partial supported", "not supported, but planned to support" and "not supported, not planned to support".

## build

| Supported | Partial supported | Will support | Will not support |
| --------- | ----------------- | ------------ | ---------------- |
| 🟢        | 🟡                | ⚪️           | ⚫️              |

| Feature         | Status | Note                                                     |
| --------------- | ------ | -------------------------------------------------------- |
| alias           | 🟢     |                                                          |
| asset           | 🟡     | public path and should keep import need to be determined |
| autoExtension   | 🟢     |                                                          |
| autoExternal    | 🟢     |                                                          |
| banner-footer   | 🟢     |                                                          |
| buildType       | 🟢     |                                                          |
| copy            | 🟢     |                                                          |
| decorator       | 🟢     |                                                          |
| define          | 🟢     |                                                          |
| dts             | 🟢     |                                                          |
| dts-composite   | ⚪️     |                                                          |
| esbuildOptions  | ⚫️    |                                                          |
| externals       | 🟢     |                                                          |
| format          | 🟢     |                                                          |
| input           | 🟢     |                                                          |
| jsx             | ⚪️     |                                                          |
| metafile        | ⚫️    |                                                          |
| minify          | 🟢     |                                                          |
| platform        | 🟢     |                                                          |
| redirect        | ⚪️     |                                                          |
| resolve         | 🟢     |                                                          |
| shims           | 🟢     |                                                          |
| sideEffects     | ⚪️     |                                                          |
| sourceDir       | 🟢     |                                                          |
| sourceMap       | 🟢     |                                                          |
| splitting       | ⚪️     |                                                          |
| style           | 🟡     | asset svgr in CSS / css banner and footer                |
| target          | 🟢     |                                                          |
| transformImport | 🟢     |                                                          |
| transformLodash | 🟢     |                                                          |
| tsconfig        | 🟢     |                                                          |
| tsconfigExtends | 🟢     |                                                          |
| umdGlobals      | 🟢     |                                                          |
| umdModuleName   | 🟡     | lacks 1. non string type 2. auto transform to camel case |
