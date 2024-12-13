/*! Legal Comment */
import { jsx } from 'react/jsx-runtime';

export const foo = () => {};

const bar = () => {};
const baz = () => {
  return bar();
};

// normal comment
export const Button = () => /*#__PURE__*/ jsx('button', {});
