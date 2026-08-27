import {
  Layout as BaseLayout,
  DocLayout as BasicDocLayout,
  Link,
  type DocLayoutProps,
} from '@rspress/core/theme-original';
import { BlogBackButton } from '@rstackjs/doc-ui/blog-back-button';
import { NavIcon } from '@rstackjs/doc-ui/nav-icon';
import { HomeLayout } from './pages';
import '@rstackjs/doc-ui/theme.css';
import './index.scss';
import { useLang, usePage } from '@rspress/core/runtime';
import {
  Search as PluginAlgoliaSearch,
  ZH_LOCALES,
} from '@rspress/plugin-algolia/runtime';

const DocLayout = (props: DocLayoutProps) => {
  const { page } = usePage();
  const lang = useLang();

  return (
    <BasicDocLayout
      {...props}
      beforeDocContent={
        <>
          <BlogBackButton
            pathname={page.routePath}
            lang={lang}
            LinkComp={Link}
          />
          {props.beforeDocContent}
        </>
      }
    />
  );
};

const Layout = () => <BaseLayout beforeNavTitle={<NavIcon />} />;

const Search = () => {
  const lang = useLang();
  return (
    <PluginAlgoliaSearch
      docSearchProps={{
        appId: 'TICGXW7OMD', // cspell:disable-line
        apiKey: '08656eae2f8e85d7f3473574000889f2', // cspell:disable-line
        indexName: 'lib',
        searchParameters: {
          facetFilters: [`lang:${lang}`],
        },
      }}
      locales={ZH_LOCALES}
    />
  );
};

export { DocLayout, Layout, HomeLayout, Search };

export * from '@rspress/core/theme-original';
