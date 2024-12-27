// can not be resolved
import lodash from 'lodash';
// can be resolved but not specified -- phantom dependency
import prettier from 'prettier';
import bar from './bar.js';
import foo from './foo';

console.log('prettier: ', prettier);

export default lodash.toUpper(foo + bar);
