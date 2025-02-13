export const foo = () => {
  const React = require('react');
  const e1 = require('e1');
  const e2 = require('e2');
  const e3 = require('e3');
  const e4 = require('e4');
  const e5 = require('e5');
  const e6 = require('e6');
  const e7 = require('e7');
  const e8 = require('e8');
  const add = require('lodash/add');
  const drop = require('lodash/drop');
  return React.version + e1 + e2 + e3 + e4 + e5 + e6 + e7 + e8 + add + drop;
};
