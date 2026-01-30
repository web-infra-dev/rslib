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

/**
 * Parse template input string and return the full template name with language suffix.
 * If the input already ends with a valid language suffix (ts/js), use it as-is.
 * Otherwise, append '-ts' as the default language.
 */
export function parseTemplateName(template: string): string {
  const pair = template.split('-');
  const lastPart = pair[pair.length - 1];
  // Check if the last part is a valid language suffix
  if (lastPart === 'ts' || lastPart === 'js') {
    const language = lastPart;
    const rest = pair.slice(0, pair.length - 1).join('-');
    return `${rest}-${language}`;
  }
  // No language suffix provided, default to 'ts'
  return `${template}-ts`;
}

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

function mapTestingToolTemplate(templateName: string): string {
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
  extraTools: [
    {
      value: 'rspress',
      label: 'Rspress - documentation',
      when: (templateName) => templateName.startsWith('react-ts'),
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
      when: (templateName) =>
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
    {
      value: 'rstest',
      label: 'Rstest - testing',
      action: ({ templateName, distFolder, addAgentsMdSearchDirs }) => {
        const rstestTemplate = mapTestingToolTemplate(templateName);
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
        const vitestTemplate = mapTestingToolTemplate(templateName);
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
