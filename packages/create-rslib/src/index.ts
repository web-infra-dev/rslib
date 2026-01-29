#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Argv,
  BUILTIN_TOOLS,
  checkCancel,
  create,
  type ESLintTemplateName,
  multiselect,
  select,
} from 'create-rstack';
import { composeTemplateName, type Lang, TEMPLATES } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type TemplateName = 'react' | 'node' | 'vue';

async function getTemplateName(argv: Argv) {
  if (typeof argv.template === 'string') {
    const pair = argv.template.split('-');
    const lang = pair[pair.length - 1] ?? 'ts';
    const rest = pair.slice(0, pair.length - 1).join('-');
    const tools = (
      typeof argv.tools === 'string' ? [argv.tools] : (argv.tools ?? [])
    ).filter((tool) => !BUILTIN_TOOLS.includes(tool));

    return composeTemplateName({
      template: rest,
      lang: lang as Lang,
      tools,
    });
  }

  const templateName = checkCancel<TemplateName>(
    await select({
      message: 'Select template',
      options: [
        { value: 'node-esm', label: 'Node.js pure ESM package' },
        { value: 'node-dual', label: 'Node.js dual ESM/CJS package' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        // { value: 'universal', label: 'universal' }, // TODO: provide universal template in the future?
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

  const supportStorybook = ['react', 'vue'].includes(templateName);
  const supportRspress = ['react'].includes(templateName);

  type ExcludesFalse = <T>(x: T | false) => x is T;

  async function selectTools() {
    const tools = checkCancel<string[]>(
      await multiselect({
        message:
          'Select development tools (Use <space> to select, <enter> to continue)',
        required: false,
        options: [
          supportRspress && {
            value: 'rspress',
            label: 'Rspress',
          },
          supportStorybook && {
            value: 'storybook',
            label: 'Storybook',
          },
          { value: 'rstest', label: 'Rstest' },
          { value: 'vitest', label: 'Vitest' },
        ].filter(Boolean as any as ExcludesFalse),
      }),
    );

    if (tools.includes('rstest') && tools.includes('vitest')) {
      console.error(
        'You selected both Rstest and Vitest for testing, you should only select one of them.',
      );
      return selectTools();
    }
    return tools;
  }

  const tools = await selectTools();

  return composeTemplateName({
    template: templateName,
    lang: language as Lang,
    tools,
  });
}

function mapESLintTemplate(templateName: string) {
  const language = templateName.split('-').pop();
  return `vanilla-${language}` as ESLintTemplateName;
}

create({
  root: path.resolve(__dirname, '..'),
  name: 'rslib',
  templates: TEMPLATES.map(({ template, tools, lang }) =>
    composeTemplateName({ template, lang, tools: Object.keys(tools || {}) }),
  ),
  getTemplateName,
  mapESLintTemplate,
});
