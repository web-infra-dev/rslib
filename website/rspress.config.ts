import path from 'node:path';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rspress/core';
import { pluginAlgolia } from '@rspress/plugin-algolia';
import { pluginRss } from '@rspress/plugin-rss';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginTwoslash } from '@rspress/plugin-twoslash';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
} from '@shikijs/transformers';
import { pluginGoogleAnalytics } from 'rsbuild-plugin-google-analytics';
import { pluginOpenGraph } from 'rsbuild-plugin-open-graph';
import pluginFileTree from 'rspress-plugin-file-tree';
import { pluginFontOpenSans } from 'rspress-plugin-font-open-sans';

const siteUrl = 'https://rslib.rs';
const description = 'The Rsbuild-based library development tool';
const descriptionZh = '基于 Rsbuild 的库构建工具';

export default defineConfig({
  title: 'Rslib',
  description:
    'Rslib is a library development tool that leverages the well-designed configurations and plugins of Rsbuild.',
  lang: 'en',
  icon: 'https://assets.rspack.rs/rslib/rslib-logo-192x192.png',
  logo: 'https://assets.rspack.rs/rslib/rslib-logo-192x192.png',
  logoText: 'Rslib',
  root: path.join(__dirname, 'docs'),
  markdown: {
    shiki: {
      transformers: [transformerNotationHighlight(), transformerNotationDiff()],
    },
  },
  search: {
    codeBlocks: true,
  },
  llms: true,
  plugins: [
    pluginAlgolia(),
    pluginFontOpenSans(),
    pluginTwoslash({
      cache: false,
    }),
    pluginFileTree(),
    pluginRss({
      siteUrl,
      feed: [
        {
          id: 'blog-rss',
          test: /^\/blog\/.+/,
          title: 'Rslib Blog',
          language: 'en',
          output: {
            type: 'rss',
            filename: 'blog-rss.xml',
          },
        },
        {
          id: 'blog-rss-zh',
          test: /^\/zh\/blog\/.+/,
          title: 'Rslib 博客',
          language: 'zh-CN',
          output: {
            type: 'rss',
            filename: 'blog-rss-zh.xml',
          },
        },
      ],
    }),
    pluginSitemap({
      siteUrl,
    }),
  ],
  route: {
    cleanUrls: true,
    // exclude document fragments from routes
    exclude: ['**/zh/shared/**', '**/en/shared/**'],
  },
  head: [
    ({ routePath }) => {
      const getOgImage = () => {
        if (routePath.endsWith('blog/introducing-rslib')) {
          return 'assets/rslib-og-image-introducing.png';
        }
        return 'rslib-og-image.png';
      };
      return `<meta property="og:image" content="https://assets.rspack.rs/rslib/${getOgImage()}">`;
    },
  ],
  themeConfig: {
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
    editLink: {
      docRepoBaseUrl:
        'https://github.com/web-infra-dev/rslib/tree/main/website/docs',
    },
    locales: [
      {
        lang: 'en',
        label: 'English',
        title: 'Rslib',
        description,
      },
      {
        lang: 'zh',
        label: '简体中文',
        title: 'Rslib',
        description: descriptionZh,
      },
    ],
  },
  builderConfig: {
    resolve: {
      alias: {
        '@components': path.join(__dirname, '@components'),
        '@en': path.join(__dirname, 'docs/en'),
        '@zh': path.join(__dirname, 'docs/zh'),
      },
    },
    plugins: [
      pluginGoogleAnalytics({ id: 'G-Q66CEHQ6JR' }),
      pluginSass(),
      pluginOpenGraph({
        title: 'Rslib',
        type: 'website',
        url: siteUrl,
        description,
        twitter: {
          site: '@rspack_dev',
          card: 'summary_large_image',
        },
      }),
    ],
  },
});
