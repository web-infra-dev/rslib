<picture>
  <img alt="Rslib Banner" src="https://assets.rspack.dev/rslib/rslib-banner.png">
</picture>

# Usage

```
import { pluginModuleFederation } from '@rsbuild/plugin-module-federation';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    // ...
    {
      format: 'mf',
      output: {
        distPath: {
          root: './dist/mf',
        },
        assetPrefix: 'http://localhost:3001/mf',
      },
      plugins: [
        pluginModuleFederation({
          name: 'rslib_provider',
          exposes: {
            '.': './src/index.tsx',
          },
          shared: {
            react: {
              singleton: true,
            },
            'react-dom': {
              singleton: true,
            },
          },
        }),
      ],
    },
  ],
});

```

# Rslib

Rslib is a library build tool powered by [Rsbuild](https://rsbuild.dev). It allows library developers to leverage the knowledge and ecosystem of webpack and Rspack.

## Documentation

https://lib.rsbuild.dev/

## Contributing

Please read the [Contributing Guide](https://github.com/web-infra-dev/rslib/blob/main/CONTRIBUTING.md).

## License

Rslib is [MIT licensed](https://github.com/web-infra-dev/rslib/blob/main/LICENSE).
