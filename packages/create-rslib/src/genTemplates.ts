import { TEMPLATES, genTemplate } from './helpers';

function main() {
  for (const template of TEMPLATES) {
    genTemplate(template);
  }

  console.log('✨ Templates generated.');
}

main();
