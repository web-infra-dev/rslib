# @examples/mf-react-component

This example demonstrates how to use Rslib to build a simple Module Federation React component.

### Usage

Dev MF module

1. start remote module which is loaded by rslib module

```
cd examples/module-federation/mf-remote && pnpm dev
```

2. start dev mode of rslib module

```
cd examples/module-federation/mf-react-component && pnpm dev
```

3. use storybook to dev rslib module

```
cd examples/module-federation/mf-react-component && pnpm storybook
```

Build

```
cd examples/module-federation/mf-react-component && pnpm build
```

Build and Serve dist

```
cd examples/module-federation/mf-react-component && pnpm serve
```
