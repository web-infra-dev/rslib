export const baz = async () => {
  const foo = require('foo');
  const bar = require('bar');
  const baz = require('./baz'); // not externalized
  const qux = require('qux');
  const quxx = await import('quxx');
  foo();
  bar();
  baz();
  qux();
  quxx();
};
