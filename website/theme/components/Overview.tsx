import { useLang } from '@rspress/core/runtime';
import { type Group, OverviewGroup } from '@rspress/core/theme-original';
import { useI18nUrl } from './utils';

export default function Overview() {
  const tUrl = useI18nUrl();
  const lang = useLang();

  const OVERVIEW_GROUPS = [
    {
      name: lang === 'en' ? 'Lib configurations' : 'Lib 配置',
      link: '/config/lib/',
      items: [
        { text: 'lib.autoExtension', link: '/config/lib/auto-extension' },
        { text: 'lib.autoExternal', link: '/config/lib/auto-external' },
        { text: 'lib.banner', link: '/config/lib/banner' },
        { text: 'lib.bundle', link: '/config/lib/bundle' },
        { text: 'lib.dts', link: '/config/lib/dts' },
        { text: 'lib.experiments', link: '/config/lib/experiments' },
        { text: 'lib.externalHelpers', link: '/config/lib/external-helpers' },
        { text: 'lib.footer', link: '/config/lib/footer' },
        { text: 'lib.format', link: '/config/lib/format' },
        { text: 'lib.id', link: '/config/lib/id' },
        { text: 'lib.outBase', link: '/config/lib/out-base' },
        { text: 'lib.redirect', link: '/config/lib/redirect' },
        { text: 'lib.shims', link: '/config/lib/shims' },
        { text: 'lib.syntax', link: '/config/lib/syntax' },
        { text: 'lib.umdName', link: '/config/lib/umd-name' },
      ],
    },
    {
      name: lang === 'en' ? 'Rsbuild configurations' : 'Rsbuild 配置',
      link: '/config/rsbuild/index',
      items: [
        { text: 'logLevel', link: '/config/rsbuild/log-level' },
        { text: 'output', link: '/config/rsbuild/output' },
        { text: 'performance', link: '/config/rsbuild/performance' },
        { text: 'plugins', link: '/config/rsbuild/plugins' },
        { text: 'resolve', link: '/config/rsbuild/resolve' },
        { text: 'source', link: '/config/rsbuild/source' },
        { text: 'tools', link: '/config/rsbuild/tools' },
      ],
    },
  ];

  const group: Group = {
    name: '',
    items: OVERVIEW_GROUPS.map((item) => ({
      text: item.name,
      link: tUrl(item.link),
      items: item.items.map(({ link, text }) => {
        return {
          link: tUrl(link),
          text,
        };
      }),
    })),
  };

  return <OverviewGroup group={group} />;
}
