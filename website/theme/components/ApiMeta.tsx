import { useLang } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme';
import styles from './ApiMeta.module.scss';

export interface ApiMetaProps {
  addedVersion?: string;
  deprecatedVersion?: string;
  inline?: boolean;
}

export function ApiMeta(props: ApiMetaProps) {
  const lang = useLang();
  const tagStyle = props.inline ? styles.tagInline : styles.tag;
  const wrapperStyle = props.inline ? styles.wrapperInline : styles.wrapper;
  const formatVersion = (version: string) => `v${version.replace(/^v/, '')}`;
  const getGitTagHref = (version: string) =>
    `https://github.com/web-infra-dev/rslib/releases/tag/${formatVersion(version)}`;

  return (
    <div className={`${wrapperStyle} rp-not-doc`}>
      {props.addedVersion && (
        <span className={`${tagStyle} ${styles.added}`}>
          <Link href={getGitTagHref(props.addedVersion)}>
            {lang === 'zh'
              ? `${formatVersion(props.addedVersion)} 新增`
              : `Added in ${formatVersion(props.addedVersion)}`}
          </Link>
        </span>
      )}
      {props.deprecatedVersion && (
        <span className={`${tagStyle} ${styles.deprecated}`}>
          {lang === 'zh'
            ? `${formatVersion(props.deprecatedVersion)} 废弃`
            : `Deprecated in ${formatVersion(props.deprecatedVersion)}`}
        </span>
      )}
    </div>
  );
}
