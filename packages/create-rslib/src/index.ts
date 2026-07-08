#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Argv,
  checkCancel,
  copyFolder,
  create,
  type ESLintTemplateName,
  type RslintTemplateName,
  select,
} from 'create-rstack';
import { parseTemplateName } from './parseTemplateName';

export type Lang = 'ts' | 'js';

// Base templates list (without tools combinations)
export const TEMPLATES: string[] = [
  'node-dual-js',
  'node-dual-ts',
  'node-esm-js',
  'node-esm-ts',
  'react-js',
  'react-ts',
  'vue-js',
  'vue-ts',
  'svelte-js',
  'svelte-ts',
  'solid-js',
  'solid-ts',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getTemplateName({ template }: Argv) {
  if (typeof template === 'string') {
    return parseTemplateName(template);
  }

  const templateName = checkCancel<string>(
    await select({
      message: 'Select template',
      options: [
        { value: 'node-esm', label: 'Node.js pure ESM package' },
        { value: 'node-dual', label: 'Node.js dual ESM/CJS package' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'solid', label: 'Solid' },
      ],
    }),
  );

  const language = checkCancel<string>(
    await select({
      message: 'Select language',
      options: [
        { value: 'ts', label: 'TypeScript' },
        { value: 'js', label: 'JavaScript' },
      ],
    }),
  );

  return `${templateName}-${language}`;
}

function mapESLintTemplate(templateName: string): ESLintTemplateName {
  switch (templateName) {
    case 'react-js':
    case 'react-ts':
    case 'vue-js':
    case 'vue-ts':
    case 'svelte-js':
    case 'svelte-ts':
      return templateName;
    default: {
      const language = templateName.split('-').pop();
      return `vanilla-${language}` as ESLintTemplateName;
    }
  }
}

function mapRslintTemplate(templateName: string): RslintTemplateName {
  switch (templateName) {
    case 'react-js':
    case 'react-ts':
      return templateName;
    default: {
      const language = templateName.split('-').pop();
      return `vanilla-${language}` as RslintTemplateName;
    }
  }
}

function getPackageName(distFolder: string): string {
  const pkgPath = path.join(distFolder, 'package.json');
  const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return pkgContent.name;
}

function replacePackageNamePlaceholder(
  distFolder: string,
  files: string[],
  packageName: string,
): void {
  for (const file of files) {
    const filePath = path.join(distFolder, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const replaced = content.replace(/\{\{ packageName \}\}/g, packageName);
      fs.writeFileSync(filePath, replaced);
    }
  }
}

create({
  root: path.resolve(__dirname, '..'),
  name: 'rslib',
  templates: TEMPLATES,
  getTemplateName,
  mapESLintTemplate,
  mapRslintTemplate,
  extraTools: [
    {
      value: 'react-compiler',
      label: 'React Compiler - optimization',
      order: 'pre',
      when: ({ templateName }) => templateName.startsWith('react-'),
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const toolFolder = path.join(
          __dirname,
          '..',
          'template-react-compiler',
        );
        const subFolder = path.join(toolFolder, templateName);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });

        addAgentsMdSearchDirs(toolFolder);
      },
    },
    {
      value: 'rspress',
      label: 'Rspress - documentation',
      when: ({ templateName }) => templateName.startsWith('react-ts'),
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const toolFolder = path.join(__dirname, '..', 'template-rspress');
        const subFolder = path.join(toolFolder, templateName);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });

        const packageName = getPackageName(distFolder);
        replacePackageNamePlaceholder(
          distFolder,
          ['docs/Button.mdx', 'tsconfig.json'],
          packageName,
        );

        addAgentsMdSearchDirs(toolFolder);
      },
    },
    {
      value: 'storybook',
      label: 'Storybook - component development',
      when: ({ templateName }) =>
        templateName.startsWith('react') || templateName.startsWith('vue'),
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const toolFolder = path.join(__dirname, '..', 'template-storybook');
        const subFolder = path.join(toolFolder, templateName);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });
        addAgentsMdSearchDirs(toolFolder);
      },
    },
  ],
  extraSkills: [
    {
      value: 'rslib-best-practices',
      label: 'Rslib - best practices',
      source: 'rstackjs/agent-skills',
    },
    {
      value: 'rstest-best-practices',
      label: 'Rstest - best practices',
      source: 'rstackjs/agent-skills',
    },
    {
      value: 'rspress-custom-theme',
      label: 'Rspress - custom theme',
      source: 'rstackjs/agent-skills',
      when: ({ tools }) => tools.includes('rspress'),
    },
    {
      value: 'rspress-description-generator',
      label: 'Rspress - description generator',
      source: 'rstackjs/agent-skills',
      when: ({ tools }) => tools.includes('rspress'),
    },
  ],
});
