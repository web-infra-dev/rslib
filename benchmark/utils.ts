import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rslibBuild } from '@e2e/helper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getCwdByExample(exampleName: string) {
  return path.join(__dirname, '../examples', exampleName);
}

export { rslibBuild };
