import { Announcement } from '@rstack-dev/doc-ui/announcement';
import { NavIcon } from '@rstack-dev/doc-ui/nav-icon';
import { NoSSR, useLang, usePageData } from 'rspress/runtime';
import Theme from 'rspress/theme';
import { HomeLayout } from './pages';
import './index.scss';

const Layout = () => {
  const { page } = usePageData();
  const lang = useLang();
  return (
    <Theme.Layout
      beforeNavTitle={<NavIcon />}
      beforeNav={
        <NoSSR>
          <Announcement
            href={`${page.routePath.replace('/zh', '')}`}
            message={'🚧 Rslib 中文文档正在施工中，点击查阅英文文档'}
            localStorageKey="rslib-announcement-closed"
            display={lang === 'zh'}
          />
        </NoSSR>
      }
    />
  );
};

export default {
  ...Theme,
  Layout,
  HomeLayout,
};

export * from 'rspress/theme';
