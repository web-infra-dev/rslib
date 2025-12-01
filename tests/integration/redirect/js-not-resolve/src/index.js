// can not be resolved
import lodash from 'lodash';
// can be resolved but not specified -- phantom dependency
import prettier from 'prettier';
import bar from './bar.js';
import baz from './baz.cjs';
import foo from './foo';
import foo_node from './foo.node';
import foo_node_js from './foo.node.js';

export default lodash.toUpper(
  foo + foo_node + foo_node_js + bar + baz + typeof prettier.version,
);
