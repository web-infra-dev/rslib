# Modern.js Module coverage

Rslib will try to cover the common scenarios in the [integration test cases of Modern.js Module](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module). This document is used to record the coverage situation. The supported types are divided into three types: "fully supported", "Partial supported", "not supported, but planned to support" and "not supported, not planned to support".

| Fully supported | Partial supported | Will support | Will not support |
| --------------- | ----------------- | ------------ | ---------------- |
| 🟢              | 🟡                | ⚪️           | ⚫️              |

## [build](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module/fixtures/build)

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

## [dev](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module/fixtures/dev)

Not applicable, Rslib doesn't introduce new plugin system.

## [platform](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module/fixtures/platform)

Not applicable, the doc tool integrated with Rspress will be implemented decoupled from Rslib.

## [preset](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module/fixtures/preset)

Not applicable, Rslib will provide a more simple unencapsulated build boilerplate.

## [plugins](https://github.com/web-infra-dev/modern.js/tree/main/tests/integration/module/plugins)

Rslib could reuse the plugins from Rsbuild, which means the [official plugins](https://edenx.bytedance.net/module-tools/en/plugins/official-list/overview.html) provided by Modern Module could be replaced by Rsbuild plugins.

| Plugins                                | Status | Note                                                                          |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| @modern-js/plugin-module-import        | 🟢     | Use https://rsbuild.dev/config/source/transform-import#sourcetransformimport. |
| @modern-js/plugin-module-banner        | 🟢     | BannerPlugin.                                                                 |
| @modern-js/plugin-module-node-polyfill | ⚪️     | Use https://github.com/rspack-contrib/rsbuild-plugin-node-polyfill.           |
| @modern-js/plugin-module-polyfill      | ⚪️     | Use https://rsbuild.dev/config/output/polyfill#outputpolyfill.                |
| @modern-js/plugin-module-babel         | 🟢     | Use https://rsbuild.dev/plugins/list/plugin-babel.                            |
| @modern-js/plugin-module-vue           | ⚪️     | Use https://rsbuild.dev/plugins/list/plugin-vue.                              |

##
