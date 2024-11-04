import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Argv,
  type ESLintTemplateName,
  checkCancel,
  create,
  multiselect,
  select,
} from 'create-rstack';
import { type Lang, TEMPLATES, composeTemplateName } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type TemplateName = 'react' | 'node';

async function getTemplateName({ template }: Argv) {
  if (typeof template === 'string') {
    const pair = template.split('-');
    const lang = pair[pair.length - 1];
    if (lang && ['js', 'ts'].includes(lang)) {
      return template;
    }
    // default to ts
    return `${template}-ts`;
  }

  const templateName = checkCancel<TemplateName>(
    await select({
      message: 'Select templates',
      options: [
        { value: 'node-dual', label: 'Node.js dual ESM/CJS package' },
        { value: 'node-esm', label: 'Node.js pure ESM package' },
        { value: 'react', label: 'React' },
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

  const supportStorybook = templateName === 'react';

  type ExcludesFalse = <T>(x: T | false) => x is T;
  const tools = checkCancel<string[]>(
    await multiselect({
      message:
        'Select development tools (Use <space> to select, <enter> to continue)',
      required: false,
      options: [
        supportStorybook && {
          value: 'storybook',
          label: 'Storybook',
        },
        { value: 'vitest', label: 'Vitest' },
        // TODO: support Rspress Module doc in the future
      ].filter(Boolean as any as ExcludesFalse),
    }),
  );

  return composeTemplateName({
    template: templateName,
    lang: language as Lang,
    tools: Object.fromEntries(
      tools.map((tool) => [tool, `vitest-${tool}-${language}`]),
    ),
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
    composeTemplateName({ template, lang, tools }),
  ),
  getTemplateName,
  mapESLintTemplate,
});
