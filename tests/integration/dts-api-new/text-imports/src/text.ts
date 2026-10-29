import json from './data.json' with { type: 'text' };
import script from './script.js' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import raw from './data.json?raw';

export const jsonText = json;
export const scriptText = script;
export const cssText = css;
export const rawText = raw;
export const loadText = async () =>
  (await import('./script.js', { with: { type: 'text' } })).default;
