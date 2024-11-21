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

Rslib is a library development tool that leverages the well-designed configurations and plugins of [Rsbuild](https://rsbuild.dev), empowering library developers to take advantage of the extensive knowledge and ecosystem of webpack and Rspack.

## ✨ Why Rslib?

In the past, we typically did not use webpack or Rspack to build ESM packages because they often included excessive runtime code, making them less friendly to package consumers. However, the community has developed a vast ecosystem around webpack and Rspack, which provides powerful features like tree shaking, code splitting, module federation and more.

So we decided to create Rslib. It improves the quality of ESM output from Rspack and webpack, leverages their extensive ecosystem, and utilizes Rsbuild's excellent out-of-the-box configuration. Rslib aims to provide a superior developer experience and explore new possibilities based on the Rspack architecture.

![](https://assets.rspack.dev/rsbuild/assets/rspack-stack-layers.png)

Rslib is still in its early stages and under active development. We are building Rslib by working in two main parts:

- [bundler support track](https://github.com/web-infra-dev/rslib/issues/45): Improve the quality of ESM / CJS outputs by contributing to Rspack and webpack.
- [Rslib features track](https://github.com/web-infra-dev/rslib/issues/46): Develop the core features of Rslib.

The roadmap may change as we move forward.

## 🔥 Features

Rslib has the following features:

- **Compilation of diverse languages**: TypeScript, JSX, Sass, Less, CSS Modules, Wasm, and more.
- **Flexible build modes**: Bundle and bundleless options to meet varying needs.
- **Multiple output formats**: ESM, CJS, and UMD for maximum compatibility.
- **Declaration file generation**: Including isolated declarations.
- **Advanced features**: Module Federation, asset compression, PostCSS, Lightning CSS, and more.

## 📚 Getting Started

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

> New contributors welcome!

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

### Contributors

<a href="https://github.com/web-infra-dev/rslib/graphs/contributors" target="_blank">
  <table>
    <tr>
      <th colspan="2">
        <br/>
        <img src="https://contrib.rocks/image?repo=web-infra-dev/rslib&columns=16&max=96"><br/><br/>
      </th>
    </tr>
    <tr>
      <td>
        <picture>
          <source 
            media="(prefers-color-scheme: dark)" 
            srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_90_days&owner_id=87694465&repo_ids=766839449&image_size=2x3&color_scheme=dark"
          />
          <img 
            alt="Contributors of web-infra-dev/rslib" 
            src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_90_days&owner_id=87694465&repo_ids=766839449&image_size=2x3&color_scheme=light"
          />
        </picture>
      </td>
      <td rowspan="2">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=new&period=past_90_days&owner_id=87694465&repo_ids=766839449&image_size=4x7&color_scheme=dark">
          <img alt="New trends of web-infra-dev" src="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=new&period=past_90_days&owner_id=87694465&repo_ids=766839449&image_size=4x7&color_scheme=light">
        </picture>
      </td>
    </tr>
    <tr>
      <td>
        <picture>
          <source 
            media="(prefers-color-scheme: dark)" 
            srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_90_days&owner_id=87694465&repo_ids=766839449&image_size=2x3&color_scheme=dark"
          />
          <img 
            alt="Contributors of web-infra-dev/rslib" 
            src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_90_days&owner_id=87694465&repo_ids=766839449&image_size=2x3&color_scheme=light"
          />
        </picture>
      </td>
    </tr>
  </table>
</a>

### Code of Conduct

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
