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
        { text: 'autoExtension', link: '/config/lib/auto-extension' },
        { text: 'autoExternal', link: '/config/lib/auto-external' },
        { text: 'banner', link: '/config/lib/banner' },
        { text: 'bundle', link: '/config/lib/bundle' },
        { text: 'dts', link: '/config/lib/dts' },
        { text: 'experiments', link: '/config/lib/experiments' },
        { text: 'exports', link: '/config/lib/exports' },
        { text: 'externalHelpers', link: '/config/lib/external-helpers' },
        { text: 'footer', link: '/config/lib/footer' },
        { text: 'format', link: '/config/lib/format' },
        { text: 'id', link: '/config/lib/id' },
        { text: 'outBase', link: '/config/lib/out-base' },
        { text: 'redirect', link: '/config/lib/redirect' },
        { text: 'shims', link: '/config/lib/shims' },
        { text: 'syntax', link: '/config/lib/syntax' },
        { text: 'umdName', link: '/config/lib/umd-name' },
        { text: 'wasm', link: '/config/lib/wasm' },
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
