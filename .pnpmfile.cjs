module.exports = {
  hooks: {
    readPackage: (pkg) => {
      if (pkg.name === 'zx') {
        // zx use "@types/node": ">=20" as optionalDependencies, which may bring some unexpected updates in other packages
        delete pkg.optionalDependencies['@types/node'];
      }
      return pkg;
    },
  },
};
