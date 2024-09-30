import path from 'node:path';
import { pluginGoogleAnalytics } from 'rsbuild-plugin-google-analytics';
import { pluginFontOpenSans } from 'rspress-plugin-font-open-sans';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  plugins: [pluginFontOpenSans()],
  root: path.join(__dirname, 'docs'),
  lang: 'en',
  base: '/',
  title: 'Rslib',
  icon: 'https://assets.rspack.dev/rslib/rslib-logo.png',
  logo: {
    light: 'https://assets.rspack.dev/rslib/rslib-logo.png',
    dark: 'https://assets.rspack.dev/rslib/rslib-logo.png',
  },
  ssg: {
    strict: true,
  },
  markdown: {
    checkDeadLinks: true,
  },
  route: {
    cleanUrls: true,
    // exclude document fragments from routes
    exclude: ['**/zh/shared/**', '**/en/shared/**', './theme'],
  },
  themeConfig: {
    footer: {
      message: 'Copyright © 2024 ByteDance.',
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-infra-dev/rslib',
      },
      {
        icon: 'x',
        mode: 'link',
        content: 'https://twitter.com/rspack_dev',
      },
      {
        icon: 'discord',
        mode: 'link',
        content: 'https://discord.gg/XsaKEEk4mW',
      },
    ],
    locales: [
      {
        lang: 'en',
        label: 'English',
        title: 'Rslib',
        description: 'The Rsbuild-based library build tool',
        editLink: {
          docRepoBaseUrl:
            'https://github.com/web-infra-dev/rslib/tree/main/website/docs',
          text: '📝 Edit this page on GitHub',
        },
      },
      {
        lang: 'zh',
        label: '简体中文',
        title: 'Rslib',
        outlineTitle: '目录',
        prevPageText: '上一页',
        nextPageText: '下一页',
        description: '基于 Rsbuild 的库构建工具',
        editLink: {
          docRepoBaseUrl:
            'https://github.com/web-infra-dev/rslib/tree/main/website/docs',
          text: '📝 在 GitHub 上编辑此页',
        },
      },
    ],
  },
  builderConfig: {
    dev: {
      lazyCompilation: true,
    },
    source: {
      alias: {
        '@components': path.join(__dirname, '@components'),
        '@en': path.join(__dirname, 'docs/en'),
        '@zh': path.join(__dirname, 'docs/zh'),
      },
    },
    plugins: [pluginGoogleAnalytics({ id: 'G-Q66CEHQ6JR' })],
  },
});
