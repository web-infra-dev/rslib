import React from 'react';
import ReactJsx from 'react/jsx-runtime';

export const foo = () => {
  return [React.version, ReactJsx.jsx];
};
