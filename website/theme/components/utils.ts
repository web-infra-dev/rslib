import { useLang, usePageData, withBase } from '@rspress/core/runtime';
import { useCallback } from 'react';

export function useUrl(url: string) {
  const lang = useLang();
  const {
    siteData: { lang: defaultLang },
  } = usePageData();
  return withBase(lang === defaultLang ? url : `/${lang}${url}`);
}

export function useI18nUrl() {
  const lang = useLang();
  const {
    siteData: { lang: defaultLang },
  } = usePageData();
  return useCallback(
    (url: string) => withBase(lang === defaultLang ? url : `/${lang}${url}`),
    [lang, defaultLang],
  );
}
