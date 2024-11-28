# @examples/module-federation

Check out [Module Federation Documentation](https://module-federation.io/) for the glossary of `consumer`, `producer`, `remote`, and `host`.

## Packages

In this example directory, there are three projects included, which are:

### [mf-react-component](./mf-react-component/)

**Role**:

- Rslib project: producer
- Storybook: consumer

A React component built with Rslib in the Module Federation format. It includes a Storybook configuration that demonstrates how to develop MF in Storybook.

### [mf-remote](./mf-remote/)

**Role**: producer

A Module Federation remote module built with Rsbuild. It is consumed by [mf-react-component](./mf-react-component/) to show how a Rslib MF module could be consumed by another Rslib app while consuming other remote modules at the same time.

Extra remote module is **optional**, it is used to demonstrate a complex Module Federation set up here.

### [mf-host](./mf-host/)

**Role**: consumer

An Rsbuild app that consumes Module Federation remote module.

## Development MF

### With host app

1. Start the remote module

```bash
pnpm dev:remote
```

2. Start the Rslib MF module

```bash
pnpm dev:rslib
```

3. Start the host app

```bash
pnpm dev:host
```

Then access the host app at http://localhost:3000.

### With Storybook

1. Start the remote module

```bash
pnpm dev:remote
```

2. Start the Rslib MF module

```bash
pnpm dev:rslib
```

2. Start the host app

```bash
pnpm dev:storybook
```

Then access the host app at http://localhost:6006.
