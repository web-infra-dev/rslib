import { Badge, Link } from '@theme';
import { useLang } from 'rspress/runtime';

type Props = {
  /** Rsbuild doc URL pathname, i18n prefix stripped. */
  path: string;
  /** Badge text. */
  text: string;
  /** Badge image alt text. */
  alt?: string;
};

export function RsbuildDocBadge({ path, text, alt }: Props) {
  const langPrefix = useLang() === 'en' ? '' : '/zh';
  const href = `https://rsbuild.dev${langPrefix}${path}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rspress-toc-exclude"
    >
      <Badge type="info">
        <img
          alt={alt || text}
          style={{ height: '18px', display: 'inline', pointerEvents: 'none' }}
          src="https://assets.rspack.dev/rsbuild/rsbuild-logo.svg"
        />
        {text}
      </Badge>
    </Link>
  );
}
