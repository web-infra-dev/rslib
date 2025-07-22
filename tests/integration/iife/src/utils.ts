const addPrefix = (prefix: string, str: string, env: string): string => {
  console.log(import.meta.dirname);
  return `${env}: ${prefix}${str}`;
};

export { addPrefix };
