import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFolder } from 'create-rstack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fragmentsDir = path.resolve(__dirname, '../fragments');
const RSLIB_VERSION = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../core/package.json'), 'utf-8'),
).version;

export type Lang = 'ts' | 'js';

const getBase = ({ template, lang }: { template: string; lang: Lang }) => {
  const dir = path.resolve(fragmentsDir, `base/${template}-${lang}`);
  return dir;
};

const getTool = ({ toolDir }: { toolDir: string }) => {
  const dir = path.resolve(fragmentsDir, `tools/${toolDir}`);
  return dir;
};

export const composeTemplateName = ({
  template,
  tools,
  lang,
}: { template: string; tools?: Record<string, string>; lang: Lang }) => {
  return `[${template}]-[${(tools ? Object.keys(tools) : []).sort()}]-${lang}`;
};

export function genTemplate({
  template,
  lang,
  tools,
}: { template: string; lang: Lang; tools?: Record<string, string> }): void {
  const toolKeys = tools ? Object.keys(tools) : [];
  const target = path.resolve(
    __dirname,
    `../template-${composeTemplateName({ template, tools, lang })}`,
  );
  fs.rmSync(target, { recursive: true, force: true });
  const srcBase = getBase({ template, lang });
  copyFolder({
    from: srcBase,
    to: target,
    isMergePackageJson: true,
    version: RSLIB_VERSION,
    skipFiles: [],
  });

  if (tools) {
    for (const tool of toolKeys) {
      const toolDir = getTool({ toolDir: tools[tool]! });
      copyFolder({
        from: toolDir,
        to: target,
        isMergePackageJson: true,
        version: RSLIB_VERSION,
        skipFiles: [],
      });
    }
  }
}

interface Template {
  template: string;
  lang: Lang;
  tools?: Record<string, string>;
}

export const TEMPLATES: Template[] = [
  // node-dual
  { template: 'node-dual', lang: 'js' },
  { template: 'node-dual', lang: 'ts' },
  { template: 'node-dual', lang: 'js', tools: { vitest: 'vitest-node-js' } },
  { template: 'node-dual', lang: 'ts', tools: { vitest: 'vitest-node-ts' } },
  // node-esm
  { template: 'node-esm', lang: 'js' },
  { template: 'node-esm', lang: 'ts' },
  { template: 'node-esm', lang: 'js', tools: { vitest: 'vitest-node-js' } },
  { template: 'node-esm', lang: 'ts', tools: { vitest: 'vitest-node-ts' } },
  // react-js
  {
    template: 'react',
    lang: 'js',
  },
  {
    template: 'react',
    lang: 'js',
    tools: { storybook: 'storybook-react-js' },
  },
  {
    template: 'react',
    lang: 'js',
    tools: { vitest: 'vitest-react-js' },
  },
  {
    template: 'react',
    lang: 'js',
    tools: { storybook: 'storybook-react-js', vitest: 'vitest-react-js' },
  },
  // react-ts
  {
    template: 'react',
    lang: 'ts',
  },
  {
    template: 'react',
    lang: 'ts',
    tools: { storybook: 'storybook-react-ts' },
  },
  {
    template: 'react',
    lang: 'ts',
    tools: { vitest: 'vitest-react-ts' },
  },
  {
    template: 'react',
    lang: 'ts',
    tools: { storybook: 'storybook-react-ts', vitest: 'vitest-react-ts' },
  },
] as const;
