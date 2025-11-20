import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFolder } from 'create-rstack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fragmentsDir = path.resolve(__dirname, '../fragments');

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
}: {
  template: string;
  tools?: string[];
  lang: Lang;
}) => {
  return `[${template}]-[${(tools ? tools.sort() : []).join(',')}]-${lang}`;
};

export function genTemplate({
  template,
  lang,
  tools,
}: {
  template: string;
  lang: Lang;
  tools?: Record<string, string>;
}): void {
  const toolKeys = tools ? Object.keys(tools) : [];
  const target = path.resolve(
    __dirname,
    `../template-${composeTemplateName({ template, tools: toolKeys, lang })}`,
  );
  fs.rmSync(target, { recursive: true, force: true });
  const srcBase = getBase({ template, lang });
  copyFolder({
    from: srcBase,
    to: target,
    isMergePackageJson: true,
  });

  if (tools) {
    for (const tool of toolKeys) {
      const toolDir = getTool({ toolDir: tools[tool]! });
      copyFolder({
        from: toolDir,
        to: target,
        isMergePackageJson: true,
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
  { template: 'node-dual', lang: 'js', tools: { rstest: 'rstest-node-js' } },
  { template: 'node-dual', lang: 'ts', tools: { rstest: 'rstest-node-ts' } },
  // node-esm
  { template: 'node-esm', lang: 'js' },
  { template: 'node-esm', lang: 'ts' },
  { template: 'node-esm', lang: 'js', tools: { vitest: 'vitest-node-js' } },
  { template: 'node-esm', lang: 'ts', tools: { vitest: 'vitest-node-ts' } },
  { template: 'node-esm', lang: 'js', tools: { rstest: 'rstest-node-js' } },
  { template: 'node-esm', lang: 'ts', tools: { rstest: 'rstest-node-ts' } },
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
    tools: { rstest: 'rstest-react-js' },
  },
  {
    template: 'react',
    lang: 'js',
    tools: { storybook: 'storybook-react-js', vitest: 'vitest-react-js' },
  },
  {
    template: 'react',
    lang: 'js',
    tools: { storybook: 'storybook-react-js', rstest: 'rstest-react-js' },
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
    tools: { rstest: 'rstest-react-ts' },
  },
  {
    template: 'react',
    lang: 'ts',
    tools: { storybook: 'storybook-react-ts', vitest: 'vitest-react-ts' },
  },
  {
    template: 'react',
    lang: 'ts',
    tools: { storybook: 'storybook-react-ts', rstest: 'rstest-react-ts' },
  },
  // vue-js
  {
    template: 'vue',
    lang: 'js',
  },
  {
    template: 'vue',
    lang: 'js',
    tools: { storybook: 'storybook-vue-js' },
  },
  {
    template: 'vue',
    lang: 'js',
    tools: { vitest: 'vitest-vue-js' },
  },
  {
    template: 'vue',
    lang: 'js',
    tools: { rstest: 'rstest-vue-js' },
  },
  {
    template: 'vue',
    lang: 'js',
    tools: { storybook: 'storybook-vue-js', vitest: 'vitest-vue-js' },
  },
  {
    template: 'vue',
    lang: 'js',
    tools: { storybook: 'storybook-vue-js', rstest: 'rstest-vue-js' },
  },
  // vue-ts
  {
    template: 'vue',
    lang: 'ts',
  },
  {
    template: 'vue',
    lang: 'ts',
    tools: { storybook: 'storybook-vue-ts' },
  },
  {
    template: 'vue',
    lang: 'ts',
    tools: { vitest: 'vitest-vue-ts' },
  },
  {
    template: 'vue',
    lang: 'ts',
    tools: { rstest: 'rstest-vue-ts' },
  },
  {
    template: 'vue',
    lang: 'ts',
    tools: { storybook: 'storybook-vue-ts', vitest: 'vitest-vue-ts' },
  },
  {
    template: 'vue',
    lang: 'ts',
    tools: { storybook: 'storybook-vue-ts', rstest: 'rstest-vue-ts' },
  },
] as const;
