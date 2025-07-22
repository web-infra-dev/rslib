const addPrefix = (prefix: string, str: string, env: string): string => {
  return `${import.meta.dirname} - ${env}: ${prefix}${str}`;
};

export { addPrefix };
