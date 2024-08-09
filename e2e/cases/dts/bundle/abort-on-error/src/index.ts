import type { A } from './const';

export const getA = (item: A) => {
  item.a = '0';
  return item;
};
