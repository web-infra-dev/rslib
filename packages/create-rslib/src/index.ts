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
    const lang = pair[pair.length - 1];
    if (lang && ['js', 'ts'].includes(lang)) {
      return template;
    }
    // default to js
    return `${template}-js`;
  }

  const type = checkCancel<string>(
    await select({
      message: 'Select template',
      options: [
        { value: 'node-dual', label: 'Node.js dual ESM/CJS package' },
        { value: 'node-esm', label: 'Node.js pure ESM package' },
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

  return `${type}-${language}`;
}

function mapESLintTemplate(templateName: string) {
  const language = templateName.split('-').pop();
  return `vanilla-${language}` as ESLintTemplateName;
}

create({
  root: path.resolve(__dirname, '..'),
  name: 'rslib',
  templates: ['node-dual-js', 'node-dual-ts', 'node-esm-js', 'node-esm-ts'],
  getTemplateName,
  mapESLintTemplate,
});
