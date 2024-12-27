// can not be resolved
import lodash from 'lodash';
// can be resolved but not specified -- phantom dependency
import prettier from 'prettier';

import { bar as bar2 } from '@/bar';
import { foo as foo2 } from '@/foo';
import { baz } from '~/baz';
import { bar } from './bar';
import { foo } from './foo';

console.log('prettier: ', prettier);

export default lodash.toUpper(foo + bar + foo2 + bar2 + baz);
