# @examples/mf-react-component

This example demonstrates how to use Rslib to build a simple Module Federation React component.

### Usage

Dev MF module

1. start remote module which is loaded by rslib module

```
nx run @examples/mf-remote:dev
```

2. start dev mode of rslib module

```
nx run @examples/mf-react-component:dev
```

3. use storybook to dev rslib module

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
