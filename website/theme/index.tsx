import { Layout as BaseLayout } from '@rspress/core/theme';
import {
  Search as PluginAlgoliaSearch,
  ZH_LOCALES,
} from '@rspress/plugin-algolia/runtime';
import { NavIcon } from '@rstack-dev/doc-ui/nav-icon';
import { HomeLayout } from './pages';
import './index.scss';
import { useLang } from '@rspress/core/runtime';

const Layout = () => {
  return <BaseLayout beforeNavTitle={<NavIcon />} />;
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

export { Layout, HomeLayout, Search };

export * from '@rspress/core/theme';
