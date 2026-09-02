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

[English](./README.md) | 简体中文

Rslib 是一个基于 [Rsbuild](https://rsbuild.rs/zh/) 的库开发工具。

它帮助开发者以简单的方式创建 JavaScript 库和 UI 组件库，并为库开发中的构建、调试、文档编写和测试等环节提供工具集成与最佳实践。

## 🔥 特性

Rslib 具备以下特性：

- **易于配置**：Rslib 为库开发提供开箱即用的构建能力，使开发者能够在零配置的情况下开发库项目。同时，Rslib 提供一套语义化的构建配置，可随着项目需求灵活扩展。

- **性能优先**：Rslib 由 [Rspack](https://rspack.rs/zh/) 驱动，集成了社区中基于 Rust 的高性能工具，包括 [SWC](https://swc.rs/) 和 [Lightning CSS](https://lightningcss.dev/)，以提供一流的构建速度和开发体验。

- **插件生态**：Rslib 可以使用 [Rsbuild 的官方插件](https://rsbuild.rs/zh/plugins/list/)，也兼容大部分 webpack 插件和所有 Rspack 插件，这意味着开发者可以在 Rslib 中使用社区或公司内现有的插件，并沿用在 webpack 和 Rspack 生态中积累的知识与工程经验。

- **产物灵活**：Rslib 设计时充分考虑了库发布与消费场景的多样性，支持根据不同的运行环境、分发方式和下游构建工具灵活配置产物输出，满足不同类型库的交付需求。

- **框架无关**：Rslib 不与前端 UI 框架耦合，并通过插件支持 React、Vue、Svelte、Solid 等框架，让开发者能够以一致的配置和开发方式构建不同框架的组件库。

## 📚 文档

- [Rslib v1 文档](https://rslib.rs/zh/)
- [Rslib v0 文档](https://v0.rslib.rs/zh/)

## 🦀 Rstack

Rslib 是 Rstack 的一员。Rstack 是为开发者与 Agent 打造的高性能、一体化 JavaScript 工具链。

| 名称                                                  | 描述           | 版本                                                                                                                                                                             |
| ----------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Rspack](https://github.com/web-infra-dev/rspack)     | 打包工具       | <a href="https://npmjs.com/package/@rspack/core"><img src="https://img.shields.io/npm/v/@rspack/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>     |
| [Rsbuild](https://github.com/web-infra-dev/rsbuild)   | 构建工具       | <a href="https://npmjs.com/package/@rsbuild/core"><img src="https://img.shields.io/npm/v/@rsbuild/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>   |
| [Rslib](https://github.com/web-infra-dev/rslib)       | 库开发工具     | <a href="https://npmjs.com/package/@rslib/core"><img src="https://img.shields.io/npm/v/@rslib/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>       |
| [Rspress](https://github.com/web-infra-dev/rspress)   | 静态站点生成器 | <a href="https://npmjs.com/package/@rspress/core"><img src="https://img.shields.io/npm/v/@rspress/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>   |
| [Rsdoctor](https://github.com/web-infra-dev/rsdoctor) | 构建分析工具   | <a href="https://npmjs.com/package/@rsdoctor/core"><img src="https://img.shields.io/npm/v/@rsdoctor/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [Rstest](https://github.com/web-infra-dev/rstest)     | 测试框架       | <a href="https://npmjs.com/package/@rstest/core"><img src="https://img.shields.io/npm/v/@rstest/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>     |
| [Rslint](https://github.com/web-infra-dev/rslint)     | 代码检查工具   | <a href="https://npmjs.com/package/@rslint/core"><img src="https://img.shields.io/npm/v/@rslint/core?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>     |

## 🔗 链接

- [awesome-rstack](https://github.com/rstackjs/awesome-rstack)：与 Rstack 相关的精彩内容列表。
- [agent-skills](https://github.com/rstackjs/agent-skills)：Rstack 的 Agent Skills 合集。
- [rstack-examples](https://github.com/rstackjs/rstack-examples)：Rstack 的示例项目。
- [storybook-rsbuild](https://github.com/rstackjs/storybook-rsbuild)：基于 Rsbuild 构建的 Storybook。
- [rsbuild-plugin-template](https://github.com/rstackjs/rsbuild-plugin-template)：使用此模板创建你的 Rsbuild 插件。
- [rstack-design-resources](https://github.com/rstackjs/rstack-design-resources)：Rstack 的设计资源。

## 🤝 参与贡献

> [!NOTE]
> 我们非常欢迎任何对 Rslib 的贡献！

请阅读 [贡献指南](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md)。

### 贡献者

<a href="https://github.com/web-infra-dev/rslib/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=web-infra-dev/rslib&columns=24">
</a>

### 行为准则

本仓库采纳了字节跳动的开源项目行为准则。请点击 [行为准则](./CODE_OF_CONDUCT.md) 查看更多的信息。

## 🧑‍💻 社区

欢迎加入我们的 [Discord](https://discord.gg/FQfm7VqU) 交流频道！Rstack 团队和用户都在那里活跃，并且我们一直期待着各种贡献。

你也可以加入 [飞书群](https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=3c3vca77-bfc0-4ef5-b62b-9c5c9c92f1b4) 与大家一起交流。

## 🙏 致谢

Rslib 的部分实现和 API 设计参考或改编自社区中的优秀开源项目。我们真诚感谢这些项目为开源社区沉淀的经验、思路与实现：

- [esbuild](https://github.com/evanw/esbuild)
- [tsup](https://github.com/egoist/tsup)
- [webpack](https://github.com/webpack/webpack)
- [mini-css-extract-plugin](https://github.com/webpack/mini-css-extract-plugin)
- [tsdown](https://github.com/rolldown/tsdown)

## 📖 License

Rslib 项目基于 [MIT 协议](https://github.com/web-infra-dev/rslib/blob/main/LICENSE)。
