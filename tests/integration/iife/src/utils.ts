const addPrefix = (prefix: string, str: string, env: string): string => {
  return `${import.meta.url} - ${env}: ${prefix}${str}`;
};

export { addPrefix };
