import { items, name } from './assets/json-named-example.json';
import exampleToml from './assets/toml-example.toml';
import exampleYaml from './assets/yaml-example.yaml';

export const Object = {
  jsonNamed: {
    name,
    items,
  },
  yamlDefault: {
    hello: exampleYaml.hello,
    foo: exampleYaml.foo,
  },
  tomlDefault: {
    hello: exampleToml.hello,
    foo: exampleToml.foo,
  },
};
