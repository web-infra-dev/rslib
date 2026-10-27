'use server';

import { useState } from 'react';

export const useBar = () => {
  const [count, setCount] = useState(0);
  return { count, setCount };
};
