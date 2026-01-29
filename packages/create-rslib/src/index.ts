#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Argv,
  checkCancel,
  copyFolder,
  create,
  type ESLintTemplateName,
  select,
} from 'create-rstack';

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
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getTemplateName({ template }: Argv) {
  if (typeof template === 'string') {
    const pair = template.split('-');
    const language = pair[pair.length - 1] ?? 'ts';
    const rest = pair.slice(0, pair.length - 1).join('-');
    return `${rest}-${language}`;
  }

  const templateName = checkCancel<string>(
    await select({
      message: 'Select template',
      options: [
        { value: 'node-esm', label: 'Node.js pure ESM package' },
        { value: 'node-dual', label: 'Node.js dual ESM/CJS package' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
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
  const language = templateName.split('-').pop();
  return `vanilla-${language}` as ESLintTemplateName;
}

function mapRstestTemplate(templateName: string): string {
  if (templateName.startsWith('react-')) {
    return templateName;
  }
  if (templateName.startsWith('vue-')) {
    return templateName;
  }
  if (templateName.startsWith('node-dual-')) {
    return templateName.replace('node-dual-', 'node-');
  }
  if (templateName.startsWith('node-esm-')) {
    return templateName.replace('node-esm-', 'node-');
  }
  const language = templateName.split('-').pop();
  return `node-${language}`;
}

function mapVitestTemplate(templateName: string): string {
  if (templateName.startsWith('react-')) {
    return templateName;
  }
  if (templateName.startsWith('vue-')) {
    return templateName;
  }
  if (templateName.startsWith('node-dual-')) {
    return templateName.replace('node-dual-', 'node-');
  }
  if (templateName.startsWith('node-esm-')) {
    return templateName.replace('node-esm-', 'node-');
  }
  const language = templateName.split('-').pop();
  return `node-${language}`;
}

function mapStorybookTemplate(templateName: string): string | null {
  if (templateName.startsWith('react-')) {
    return templateName;
  }
  if (templateName.startsWith('vue-')) {
    return templateName;
  }
  return null;
}

function mapRspressTemplate(templateName: string): string | null {
  if (templateName.startsWith('react-')) {
    return templateName;
  }
  return null;
}

create({
  root: path.resolve(__dirname, '..'),
  name: 'rslib',
  templates: TEMPLATES,
  getTemplateName,
  mapESLintTemplate,
  extraTools: [
    {
      value: 'rspress',
      label: 'Rspress - documentation',
      order: 'pre',
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const rspressTemplate = mapRspressTemplate(templateName);
        if (!rspressTemplate) {
          throw new Error(
            `Rspress is only supported for React templates, but got "${templateName}".`,
          );
        }
        const toolFolder = path.join(__dirname, '..', 'template-rspress');
        const subFolder = path.join(toolFolder, rspressTemplate);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });
        addAgentsMdSearchDirs(toolFolder);
      },
    },
    {
      value: 'storybook',
      label: 'Storybook - component development',
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const storybookTemplate = mapStorybookTemplate(templateName);
        if (!storybookTemplate) {
          throw new Error(
            `Storybook is only supported for React and Vue templates, but got "${templateName}".`,
          );
        }
        const toolFolder = path.join(__dirname, '..', 'template-storybook');
        const subFolder = path.join(toolFolder, storybookTemplate);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });
        addAgentsMdSearchDirs(toolFolder);
      },
    },
    {
      value: 'rstest',
      label: 'Rstest - testing',
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const rstestTemplate = mapRstestTemplate(templateName);
        const toolFolder = path.join(__dirname, '..', 'template-rstest');
        const subFolder = path.join(toolFolder, rstestTemplate);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });
        addAgentsMdSearchDirs(toolFolder);
      },
    },
    {
      value: 'vitest',
      label: 'Vitest - testing',
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const vitestTemplate = mapVitestTemplate(templateName);
        const toolFolder = path.join(__dirname, '..', 'template-vitest');
        const subFolder = path.join(toolFolder, vitestTemplate);

        copyFolder({
          from: subFolder,
          to: distFolder,
          isMergePackageJson: true,
        });
        addAgentsMdSearchDirs(toolFolder);
      },
    },
  ],
});
