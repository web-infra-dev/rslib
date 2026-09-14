import { Link } from '@rspress/core/theme';
import styles from './ApiMeta.module.scss';

export interface ApiMetaProps {
  addedVersion?: string;
  deprecatedVersion?: string;
  removedVersion?: string;
  inline?: boolean;
}

export function ApiMeta(props: ApiMetaProps) {
  const tagStyle = props.inline ? styles.tagInline : styles.tag;
  const wrapperStyle = props.inline ? styles.wrapperInline : styles.wrapper;
  const getGitTagHref = (version: string) =>
    `https://github.com/web-infra-dev/rslib/releases/tag/v${version.replace('v', '')}`;

  return (
    <div className={`${wrapperStyle} rp-not-doc`}>
      {props.addedVersion && (
        <span className={`${tagStyle} ${styles.added}`}>
          <Link href={getGitTagHref(props.addedVersion)}>
            Added in v{props.addedVersion}
          </Link>
        </span>
      )}
      {props.deprecatedVersion && (
        <span className={`${tagStyle} ${styles.deprecated}`}>
          Deprecated in v{props.deprecatedVersion}
        </span>
      )}
      {props.removedVersion && (
        <span className={`${tagStyle} ${styles.removed}`}>
          Removed in v{props.removedVersion}
        </span>
      )}
    </div>
  );
}
