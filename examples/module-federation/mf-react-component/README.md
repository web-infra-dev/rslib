# @examples/mf-react-component

This example demonstrates how to use Rslib to build a simple Module Federation React component.

### Usage

Dev MF module

1. Start remote module which is loaded by Rslib module.

```
nx run @examples/mf-remote:dev
```

2. Start MF dev mode.

```
nx run @examples/mf-react-component:dev
```

3. Use Storybook to development component.

```
nx run @examples/mf-react-component:storybook
```

Build

```
nx run @examples/mf-react-component:build
```

Build and Serve dist

```
nx run @examples/mf-react-component:serve
```
