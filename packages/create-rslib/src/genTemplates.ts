import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// TODO: use `mergePackageJson` from `create-rstack` in the future
import lodash from 'lodash';

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

const mergeFiles = ({ source, target }: { source: string; target: string }) => {
  const files = fs.readdirSync(source, {
    recursive: true,
    withFileTypes: true,
  });

  for (const file of files) {
    const isFile = file.isFile();
    if (isFile) {
      const relativePath = path.relative(
        source,
        path.resolve(file.parentPath, file.name),
      );
      if (
        file.name === 'package.json' &&
        fs.existsSync(path.resolve(target, 'package.json'))
      ) {
        const sourcePackageJson = fs.readFileSync(
          path.resolve(source, 'package.json'),
          { encoding: 'utf-8' },
        );
        const targetPackageJson = fs.readFileSync(
          path.resolve(target, 'package.json'),
          { encoding: 'utf-8' },
        );

        const merged = lodash.merge(
          JSON.parse(targetPackageJson),
          JSON.parse(sourcePackageJson),
        );

        fs.writeFileSync(
          path.resolve(target, 'package.json'),
          JSON.stringify(merged, null, 2),
        );
      } else {
        const targetPath = path.resolve(target, relativePath);
        const targetDir = path.dirname(targetPath);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.copyFileSync(path.resolve(source, relativePath), targetPath);
      }
    }
  }
};

export const composeTemplateName = ({
  template,
  tools,
  lang,
}: { template: string; tools?: Record<string, string>; lang: Lang }) => {
  return `[${template}]-[${(tools ? Object.keys(tools) : []).sort()}]-${lang}`;
};

function genTemplate({
  template,
  lang,
  tools,
}: { template: string; lang: Lang; tools?: Record<string, string> }) {
  const toolKeys = tools ? Object.keys(tools) : [];
  const target = path.resolve(
    __dirname,
    `../template-${composeTemplateName({ template, tools, lang })}`,
  );
  fs.rmSync(target, { recursive: true, force: true });
  const srcBase = getBase({ template, lang });
  mergeFiles({ source: srcBase, target: target });
  if (tools) {
    for (const tool of toolKeys) {
      const toolDir = getTool({ toolDir: tools[tool]! });
      mergeFiles({ source: toolDir, target });
    }
  }
}

interface Template {
  template: string;
  lang: Lang;
  tools?: Record<string, string>;
}

export const TEMPLATES: Template[] = [
  { template: 'node-dual', lang: 'js' },
  { template: 'node-dual', lang: 'ts' },
  { template: 'node-dual', lang: 'js', tools: { vitest: 'vitest-node-js' } },
  { template: 'node-dual', lang: 'ts', tools: { vitest: 'vitest-node-ts' } },

  { template: 'node-esm', lang: 'js' },
  { template: 'node-esm', lang: 'ts' },
  { template: 'node-esm', lang: 'js', tools: { vitest: 'vitest-node-js' } },
  { template: 'node-esm', lang: 'ts', tools: { vitest: 'vitest-node-ts' } },

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

function main() {
  for (const template of TEMPLATES) {
    genTemplate(template);
  }
}

main();
