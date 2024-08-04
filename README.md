<picture>
  <img alt="Rslib Banner" src="https://assets.rspack.dev/rslib/rslib-banner.png">
</picture>

# Rslib

<p>
  <a href="https://discord.gg/FQfm7VqU"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat-square&logo=discord&colorA=564341&colorB=F8F5FF" alt="Discord channel" /></a>
  <a href="https://github.com/web-infra-dev/rslib/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=F8F5FF" alt="license" /></a>
</p>

Rslib is a library build tool powered by [Rsbuild](https://rsbuild.dev). It allows package developers to leverage Rspack knowledge and its ecosystem. Rslib is built on top of Rsbuild's excellent configurations and plugins, ensuring optimal ESM output quality.

Rslib provides out-of-the-box configurations for library development, including compilation of TypeScript, JSX, Sass, Less, CSS Modules, and Wasm, supporting Module Federation, image compression, type checking, PostCSS, and Lightning CSS.

> !NOTE
> 🚧 Rslib is still in its early stages and under active development. It will be available in October 2024.
> You can check some available [examples](https://github.com/web-infra-dev/rslib/tree/main/examples) in the repository.

## ✨ Why Rslib?

In the past, we typically did not use webpack or Rspack to build ESM packages because they often included excessive runtime code, making them less friendly to package consumers. However, we have developed a vast ecosystem around webpack and Rspack, which provides powerful features like tree shaking, code splitting, and module federation. So we decided to create Rslib. This tool improves the quality of ESM output from Rspack and webpack, leverages their extensive ecosystem, and utilizes Rsbuild's excellent out-of-the-box configuration. Rslib aims to provide a superior developer experience and explore new possibilities based on the Rspack architecture.

## 📍 Roadmap

We have roadmaps for the [features track](https://github.com/web-infra-dev/rslib/issues/46) and the [bundler support track](https://github.com/web-infra-dev/rslib/issues/45). You can view the project's progress there. These roadmaps may change as we move forward.

## 🦀 Links

- [Rspack](https://github.com/web-infra-dev/rspack): A fast Rust-based web bundler.
- [Rsbuild](https://github.com/web-infra-dev/rsbuild): A high-performance build tool powered by Rspack.
- [Rspress](https://github.com/web-infra-dev/rspress): A fast static site generator based on Rsbuild.
- [Rsdoctor](https://github.com/web-infra-dev/rsdoctor): A one-stop build analyzer for Rspack and Webpack.
- [Modern.js](https://github.com/web-infra-dev/modern.js): A progressive React framework based on Rsbuild.
- [awesome-rspack](https://github.com/web-infra-dev/awesome-rspack): A curated list of awesome things related to Rspack and Rsbuild.
- [rspack-examples](https://github.com/rspack-contrib/rspack-examples): Examples for Rspack, Rsbuild, Rspress and Rsdoctor.
- [storybook-rsbuild](https://github.com/rspack-contrib/storybook-rsbuild): Storybook builder powered by Rsbuild.
- [rsbuild-plugin-template](https://github.com/rspack-contrib/rsbuild-plugin-template)：Use this template to create your own Rsbuild plugin.
- [rstack-design-resources](https://github.com/rspack-contrib/rstack-design-resources)：Design resources for Rspack, Rsbuild, Rspress and Rsdoctor.

## 🤝 Contribution

> New contributors welcome!

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

### Code of Conduct

This repo has adopted the ByteDance Open Source Code of Conduct. Please check [Code of Conduct](./CODE_OF_CONDUCT.md) for more details.

## 🧑‍💻 Community

Come and chat with us on [Discord](https://discord.gg/FQfm7VqU)! The Rstack team and users are active there, and we're always looking for contributions.

## 🙏 Credits

Some of the implementations of Rslib have drawn inspiration from outstanding projects in the community. We would like to express our gratitude to them:

- [esbuild](https://github.com/evanw/esbuild), created by [Evan Wallace](https://github.com/evanw).
- [tsup](https://github.com/egoist/tsup), created by [EGOIST](https://github.com/egoist).

## 📖 License

Rslib is licensed under the [MIT License](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
