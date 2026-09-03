<picture>
  <img alt="Rslib Banner" src="https://assets.rspack.rs/rslib/rslib-banner.png">
</picture>

# Rslib

<p>
  <a href="https://discord.gg/FQfm7VqU"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat-square&logo=discord&colorA=564341&colorB=F8F5FF" alt="Discord channel" /></a>
  <a href="https://npmjs.com/package/@rslib/core?activeTab=readme"><img src="https://img.shields.io/npm/v/@rslib/core?style=flat-square&colorA=564341&colorB=F8F5FF" alt="npm version" /></a>
  <a href="https://npmcharts.com/compare/@rslib/core?minimal=true"><img src="https://img.shields.io/npm/dm/@rslib/core.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="downloads" /></a>
  <a href="https://nodejs.org/en/about/previous-releases"><img src="https://img.shields.io/node/v/@rslib/core.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="node version"></a>
  <a href="https://github.com/web-infra-dev/rslib/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="license" /></a>
  <a href="https://deepwiki.com/web-infra-dev/rslib"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" /></a>
</p>

English | [简体中文](./README.zh-CN.md)

Rslib is a library development tool based on [Rsbuild](https://rsbuild.rs).

It gives developers a simple way to create JavaScript libraries and UI component libraries, and provides tool integrations and best practices for building, debugging, documentation, and testing throughout library development.

## 🔥 Features

Rslib has the following features:

- **Easy to configure**: Out-of-the-box tooling enables developers to build libraries with zero configuration. Rslib also provides a set of semantic build configurations that can be extended as project needs grow.

- **Performance-focused**: Powered by [Rspack](https://rspack.rs), it integrates high-performance Rust-based tools from the community, including [SWC](https://swc.rs/) and [Lightning CSS](https://lightningcss.dev/), delivering first-class build speed and development experience.

- **Plugin ecosystem**: Supports [Rsbuild plugins](https://rsbuild.rs/plugins/list/), Rspack plugins, and webpack plugins, allowing developers to reuse existing plugin ecosystems and continue using familiar development workflows and engineering practices.

- **Flexible outputs**: Designed around the diverse ways libraries are published and consumed, it supports flexible build output configuration for different runtimes, distribution methods, and downstream build tools to meet the delivery needs of different types of libraries.

- **Framework agnostic**: Decoupled from frontend UI frameworks, it supports React, Vue, Svelte, Solid, and other frameworks through plugins, allowing developers to build component libraries for different frameworks with a consistent configuration and development workflow.

## 📚 Documentation

- [Rslib v1 docs](https://rslib.rs)
- [Rslib v0 docs](https://v0.rslib.rs)

## 🦀 Rstack

Rslib is part of Rstack, the fast, unified JavaScript toolchain for developers and agents.

| Name                                                  | Description              | Version                                                                                                                                                                          |
| ----------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Rspack](https://github.com/web-infra-dev/rspack)     | Bundler                  | <a href="https://npmjs.com/package/@rspack/core"><img src="https://img.shields.io/npm/v/@rspack/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>     |
| [Rsbuild](https://github.com/web-infra-dev/rsbuild)   | Build tool               | <a href="https://npmjs.com/package/@rsbuild/core"><img src="https://img.shields.io/npm/v/@rsbuild/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>   |
| [Rslib](https://github.com/web-infra-dev/rslib)       | Library development tool | <a href="https://npmjs.com/package/@rslib/core"><img src="https://img.shields.io/npm/v/@rslib/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>       |
| [Rspress](https://github.com/web-infra-dev/rspress)   | Static site generator    | <a href="https://npmjs.com/package/@rspress/core"><img src="https://img.shields.io/npm/v/@rspress/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>   |
| [Rsdoctor](https://github.com/web-infra-dev/rsdoctor) | Build analyzer           | <a href="https://npmjs.com/package/@rsdoctor/core"><img src="https://img.shields.io/npm/v/@rsdoctor/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [Rstest](https://github.com/web-infra-dev/rstest)     | Testing framework        | <a href="https://npmjs.com/package/@rstest/core"><img src="https://img.shields.io/npm/v/@rstest/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>     |
| [Rslint](https://github.com/web-infra-dev/rslint)     | Linter                   | <a href="https://npmjs.com/package/@rslint/core"><img src="https://img.shields.io/npm/v/@rslint/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>     |

## 🔗 Links

- [awesome-rstack](https://github.com/rstackjs/awesome-rstack): A curated list of awesome things related to Rstack.
- [agent-skills](https://github.com/rstackjs/agent-skills): A collection of Agent Skills for Rstack.
- [rstack-examples](https://github.com/rstackjs/rstack-examples): Examples showcasing Rstack.
- [storybook-rsbuild](https://github.com/rstackjs/storybook-rsbuild): Storybook builder powered by Rsbuild.
- [rsbuild-plugin-template](https://github.com/rstackjs/rsbuild-plugin-template): Use this template to create your own Rsbuild plugin.
- [rstack-design-resources](https://github.com/rstackjs/rstack-design-resources): Design resources for Rstack.

## 🤝 Contribution

> [!NOTE]
> We highly value any contributions to Rslib!

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

### Contributors

<a href="https://github.com/web-infra-dev/rslib/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=web-infra-dev/rslib&columns=24">
</a>

### Code of conduct

This repo has adopted the ByteDance Open Source Code of Conduct. Please check [Code of Conduct](./CODE_OF_CONDUCT.md) for more details.

## 🧑‍💻 Community

Come and chat with us on [Discord](https://discord.gg/7uHaPXcVyV)! The Rstack team and users are active there, and we're always looking for contributions.

## 🙏 Credits

Parts of Rslib are derived from or inspired by many excellent open source projects. We sincerely appreciate the work of these projects and the ideas they have shared with the community:

- [esbuild](https://github.com/evanw/esbuild)
- [tsup](https://github.com/egoist/tsup)
- [webpack](https://github.com/webpack/webpack)
- [mini-css-extract-plugin](https://github.com/webpack/mini-css-extract-plugin)
- [tsdown](https://github.com/rolldown/tsdown)

## 📖 License

Rslib is licensed under the [MIT License](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
