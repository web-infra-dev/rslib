import {
  Layout as BaseLayout,
  DocLayout as BasicDocLayout,
  Link,
  type DocLayoutProps,
} from '@rspress/core/theme-original';
import { Announcement } from '@rstackjs/doc-ui/announcement';
import { BlogBackButton } from '@rstackjs/doc-ui/blog-back-button';
import { NavIcon } from '@rstackjs/doc-ui/nav-icon';
import { HomeLayout } from './pages';
import '@rstackjs/doc-ui/theme.css';
import './index.scss';
import { NoSSR, useLang, usePage } from '@rspress/core/runtime';
import {
  Search as PluginAlgoliaSearch,
  ZH_LOCALES,
} from '@rspress/plugin-algolia/runtime';

const ANNOUNCEMENT_URL = '/blog/v1-0';

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

const Layout = () => {
  const { page } = usePage();
  const lang = useLang();

  return (
    <BaseLayout
      beforeNavTitle={<NavIcon />}
      beforeNav={
        <NoSSR>
          <Announcement
            href={
              lang === 'en' ? ANNOUNCEMENT_URL : `/${lang}${ANNOUNCEMENT_URL}`
            }
            message={
              lang === 'en'
                ? 'Rslib 1.0 has been released!'
                : 'Rslib 1.0 正式发布！'
            }
            localStorageKey="rslib-v1-announcement-closed"
            display={page.pageType === 'home'}
          />
        </NoSSR>
      }
    />
  );
};

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
