<picture>
  <img alt="Rslib Banner" src="https://assets.rspack.dev/rslib/rslib-banner.png">
</picture>

# Rslib

<p>
  <a href="https://discord.gg/FQfm7VqU"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat-square&logo=discord&colorA=564341&colorB=F8F5FF" alt="Discord channel" /></a>
  <a href="https://npmjs.com/package/@rslib/core?activeTab=readme"><img src="https://img.shields.io/npm/v/@rslib/core?style=flat-square&colorA=564341&colorB=F8F5FF" alt="npm version" /></a>
  <a href="https://npmcharts.com/compare/@rslib/core?minimal=true"><img src="https://img.shields.io/npm/dm/@rslib/core.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="downloads" /></a>
  <a href="https://nodejs.org/en/about/previous-releases"><img src="https://img.shields.io/node/v/@rslib/core.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="node version"></a>
  <a href="https://github.com/web-infra-dev/rslib/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="license" /></a>
</p>

[English](./README.md) | 简体中文

Rslib 是一个库开发工具，它基于 [Rsbuild](https://rsbuild.dev/zh) 精心设计的配置和插件，使库开发者得以复用 webpack 和 Rspack 繁荣的知识和生态系统。

Rslib 旨在为库开发者提供：

- **丰富的构建配置与高质量的产物**：Rslib 提供了一系列丰富的构建配置，确保您的库以高质量构建并针对各种场景进行优化。
- **开发流程串联**：Rslib 通过串联构建、调试、文档和测试等阶段，简化了开发过程，提供了开箱即用的完整而高效的实践。

## 🔥 功能

Rslib 提供了以下功能：

- **多种语言的编译**: TypeScript、JSX、Sass、Less、CSS Modules、Wasm 等。
- **灵活的构建模式**: Bundle 和 bundleless 模式以满足不同的需求。
- **多种输出格式**: ESM、CJS 和 UMD 以实现最大兼容性。
- **类型声明文件生成**: 包括 isolated declarations。
- **进阶功能**: 模块联邦、资源压缩、PostCSS、Lightning CSS 等。

## 🎯 生态

Rslib 基于 Rsbuild 实现，并完全复用 Rsbuild 的能力和生态系统。

下图说明了 Rsbuild 与生态中其他工具之间的关系：

<img src="https://assets.rspack.dev/rsbuild/assets/rspack-stack-layers.png" alt="Rspack stack layers" width="760" />

## 📚 快速上手

你可以参考 [快速上手](https://lib.rsbuild.dev/zh/guide/start/quick-start) 来开始体验 Rslib。

## 🦀 链接

- [Rspack](https://github.com/web-infra-dev/rspack): 基于 Rust 的高性能打包工具。
- [Rsbuild](https://github.com/web-infra-dev/rsbuild): 由 Rspack 驱动的构建工具。
- [Rspress](https://github.com/web-infra-dev/rspress): 基于 Rsbuild 的静态站点生成器。
- [Rsdoctor](https://github.com/web-infra-dev/rsdoctor): 针对 Rspack 和 webpack 的一站式构建分析工具。
- [Modern.js](https://github.com/web-infra-dev/modern.js): 基于 Rsbuild 的渐进式 React 框架。
- [awesome-rspack](https://github.com/web-infra-dev/awesome-rspack): 与 Rspack 和 Rsbuild 相关的精彩内容列表。
- [rspack-examples](https://github.com/rspack-contrib/rspack-examples): Rspack、Rsbuild、Rspress 和 Rsdoctor 的示例项目。
- [storybook-rsbuild](https://github.com/rspack-contrib/storybook-rsbuild): 基于 Rsbuild 构建的 Storybook。
- [rsbuild-plugin-template](https://github.com/rspack-contrib/rsbuild-plugin-template): 使用此模板创建你的 Rsbuild 插件。
- [rstack-design-resources](https://github.com/rspack-contrib/rstack-design-resources): Rspack、Rsbuild、Rslib、Rspress 和 Rsdoctor 的设计资源。

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

## 🌟 质量

Rslib 通过 [Web Infra QoS](https://web-infra-qos.netlify.app?product=rslib&metrics=bundle-size) 来观测核心指标的变化情况，比如 bundle size、compile speed 和 install size。

## 🙏 致谢

Rslib 的一些实现参考了社区中杰出的项目，对他们表示感谢：

- [esbuild](https://github.com/evanw/esbuild)，由 [Evan Wallace](https://github.com/evanw) 创建。
- [tsup](https://github.com/egoist/tsup), 由 [EGOIST](https://github.com/egoist) 创建。

Rslib 网站由 [Netlify](https://www.netlify.com/) 提供支持。

## 📖 License

Rslib 项目基于 [MIT 协议](https://github.com/web-infra-dev/rslib/blob/main/LICENSE)。
