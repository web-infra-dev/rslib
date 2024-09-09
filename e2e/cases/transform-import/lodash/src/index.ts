import { get } from 'lodash';
import { add } from 'lodash/fp';

var object = { a: [{ b: { c: 'foo' } }] };

export const addOne = add(1);
export const foo = get(object, 'a[0].b.c');
