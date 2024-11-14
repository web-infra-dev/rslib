const lazyFn = (module, requireFn) => {
  requireFn(module);
};
lazyFn('./other.js', require);
