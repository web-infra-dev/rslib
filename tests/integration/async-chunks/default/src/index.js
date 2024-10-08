const foo = async () => {
  const { dyn } = await import('./dynamic.js');
  return dyn;
};

export { foo };
