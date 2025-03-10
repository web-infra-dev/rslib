import { NavIcon } from '@rstack-dev/doc-ui/nav-icon';
import { Layout as BaseLayout } from 'rspress/theme';
import { HomeLayout } from './pages';
import './index.scss';

const Layout = () => {
  return <BaseLayout beforeNavTitle={<NavIcon />} />;
};

export { Layout, HomeLayout };

export * from 'rspress/theme';
