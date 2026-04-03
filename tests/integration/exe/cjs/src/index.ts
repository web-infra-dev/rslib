import { getAsset, isSea } from 'node:sea';
import { helperMessage } from './exeHelper';

const assetMessage = isSea() ? getAsset('message', 'utf8').trim() : 'not-sea';

console.log(
  `${helperMessage}:${assetMessage}:${process.argv.slice(2).join('|')}`,
);
