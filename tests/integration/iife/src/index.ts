import { helperName } from 'globalHelper';
import { addPrefix } from './utils';

// @ts-ignore
globalThis.addPrefix = (str: string) =>
  // @ts-ignore
  addPrefix(helperName, str, process.env.NODE_ENV);
