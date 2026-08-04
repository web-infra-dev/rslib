module.exports = {
  value: 'ok',
  isStrict: (function () {
    return this === undefined;
  })(),
};
