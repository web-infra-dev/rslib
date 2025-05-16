const addPrefix = (prefix: string, str: string, env: string) =>
  `${env}: ${prefix}${str}`;

export { addPrefix };
