const d1 = __dirname;
const f1 = __filename;

export default () => {
  const d2 = __dirname;
  const f2 = __filename;
  const importMetaUrl = import.meta.url;

  return { d1, d2, f1, f2, importMetaUrl };
};
