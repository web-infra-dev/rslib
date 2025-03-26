import exampleJson, { name } from './assets/json-example.json';
import exampleToml from './assets/toml-example.toml';
import exampleYaml from './assets/yaml-example.yaml';

console.log(name);
console.log(exampleJson.items);
console.log(exampleYaml.hello);
console.log(exampleYaml.foo);
console.log(exampleToml.hello);
console.log(exampleToml.foo);
