import React from 'react';

export const fn = async (str) => {
  const { addPrefix } = await import('./common');
  return addPrefix('DEBUG', `${React.version}/${str}`);
};
