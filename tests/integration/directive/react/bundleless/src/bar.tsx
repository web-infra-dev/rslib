'use server';

import { useState } from 'react';

export const importMetaUrl = import.meta.url;

export const useBar = () => {
  const [count, setCount] = useState(0);
  return { count, setCount };
};
