import { Announcement } from '@rstack-dev/doc-ui/announcement';
import { NavIcon } from '@rstack-dev/doc-ui/nav-icon';
import { NoSSR, useLang, usePageData } from 'rspress/runtime';
import Theme from 'rspress/theme';
import { HomeLayout } from './pages';
import './index.scss';

const ANNOUNCEMENT_URL = '/';

const Layout = () => {
  const { page } = usePageData();
  const lang = useLang();
  return (
    <Theme.Layout
      beforeNavTitle={<NavIcon />}
      beforeNav={
        <NoSSR>
          <Announcement
            href={ANNOUNCEMENT_URL}
            message={
              lang === 'en'
                ? '🚧 Rslib documentation is under construction, stay tuned for a stable version!'
                : '🚧 Rslib 中文文档正在施工中，可以先查阅英文文档'
            }
            localStorageKey="rslib-announcement-closed"
            display={page.pageType === 'home'}
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
