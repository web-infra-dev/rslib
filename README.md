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

English | [简体中文](./README.zh-CN.md)

Rslib is a library development tool that leverages the well-designed configurations and plugins of [Rsbuild](https://rsbuild.dev), empowering library developers to take advantage of the extensive knowledge and ecosystem of webpack and Rspack.

Rslib aims to provide library developers with:

- **Effortless Library Creation**: Rslib provides a simple and intuitive approach that enables developers to effortlessly create high-quality JavaScript libraries, lowering the entry barrier.
- **Out-of-the-Box Build**: Rslib offers a rich set of build configurations, ready to address the diverse needs of library development scenarios.
- **Comprehensive Development Workflow**: Rslib delivers best practices for building, debugging, documenting, and testing, helping developers establish a robust workflow that enhances efficiency and quality.

## 🔥 Features

Rslib has the following features:

- **Compilation of diverse languages**: TypeScript, JSX, Sass, Less, CSS Modules, Wasm, and more.
- **Flexible build modes**: Bundle and bundleless options to meet varying needs.
- **Multiple output formats**: ESM, CJS, and UMD for maximum compatibility.
- **Declaration file generation**: Including isolated declarations.
- **Advanced features**: Module Federation, asset compression, PostCSS, Lightning CSS, and more.

## 🎯 Ecosystem

Rslib is implemented based on Rsbuild and fully reuses the capabilities and ecosystem of Rsbuild.

The following diagram illustrates the relationship between Rslib and other tools in the ecosystem:

<img src="https://assets.rspack.dev/rsbuild/assets/rspack-stack-layers.png" alt="Rspack stack layers" width="760" />

## 📚 Getting started

To get started with Rslib, see the [Quick Start](https://lib.rsbuild.dev/guide/start/quick-start).

## 🦀 Links

- [Rspack](https://github.com/web-infra-dev/rspack): A fast Rust-based web bundler.
- [Rsbuild](https://github.com/web-infra-dev/rsbuild): A high-performance build tool powered by Rspack.
- [Rspress](https://github.com/web-infra-dev/rspress): A fast static site generator based on Rsbuild.
- [Rsdoctor](https://github.com/web-infra-dev/rsdoctor): A one-stop build analyzer for Rspack and Webpack.
- [Modern.js](https://github.com/web-infra-dev/modern.js): A progressive React framework based on Rsbuild.
- [awesome-rspack](https://github.com/web-infra-dev/awesome-rspack): A curated list of awesome things related to Rspack and Rsbuild.
- [rspack-examples](https://github.com/rspack-contrib/rspack-examples): Examples for Rspack, Rsbuild, Rspress and Rsdoctor.
- [storybook-rsbuild](https://github.com/rspack-contrib/storybook-rsbuild): Storybook builder powered by Rsbuild.
- [rsbuild-plugin-template](https://github.com/rspack-contrib/rsbuild-plugin-template): Use this template to create your own Rsbuild plugin.
- [rstack-design-resources](https://github.com/rspack-contrib/rstack-design-resources): Design resources for Rspack, Rsbuild, Rspress and Rsdoctor.

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

Come and chat with us on [Discord](https://discord.gg/FQfm7VqU)! The Rstack team and users are active there, and we're always looking for contributions.

## 🌟 Quality

Rslib uses [Web Infra QoS](https://web-infra-qos.netlify.app?product=rslib&metrics=bundle-size) to observe the trend of key metrics, such as bundle size, compile speed and install size.

## 🙏 Credits

Some of the implementations of Rslib have drawn inspiration from outstanding projects in the community. We would like to express our gratitude to them:

- [esbuild](https://github.com/evanw/esbuild), created by [Evan Wallace](https://github.com/evanw).
- [tsup](https://github.com/egoist/tsup), created by [EGOIST](https://github.com/egoist).

This Rslib website is powered by [Netlify](https://www.netlify.com/).

## 📖 License

Rslib is licensed under the [MIT License](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
