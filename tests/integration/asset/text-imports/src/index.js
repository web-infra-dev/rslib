import data from './data.json';
import jsonText from './data.json' with { type: 'text' };
import { foo } from './script.js';
import scriptText from './script.js' with { type: 'text' };
import svgText from './logo.svg' with { type: 'text' };
import rawText from './data.json?raw';

export { data, foo, jsonText, scriptText, svgText, rawText };
export const loadText = async () =>
  (await import('./script.js', { with: { type: 'text' } })).default;
