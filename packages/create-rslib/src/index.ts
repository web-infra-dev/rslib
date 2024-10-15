import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Argv,
  type ESLintTemplateName,
  checkCancel,
  create,
  select,
} from 'create-rstack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getTemplateName({ template }: Argv) {
  if (typeof template === 'string') {
    const pair = template.split('-');
    const language = pair[1] ?? 'js';
    const type = pair[0];
    return `${type}-${language}`;
  }

  const type = checkCancel<string>(
    await select({
      message: 'Select template',
      options: [{ value: 'example', label: 'Example' }],
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

  return `${type}-${language}`;
}

function mapESLintTemplate(templateName: string) {
  const language = templateName.split('-')[1];
  return `vanilla-${language}` as ESLintTemplateName;
}

create({
  root: path.resolve(__dirname, '..'),
  name: 'rslib',
  templates: ['example-js', 'example-ts'],
  getTemplateName,
  mapESLintTemplate,
});
