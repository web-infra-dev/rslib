import lodash from 'lodash';

import { bar as bar2 } from '@/bar';
import { foo as foo2 } from '@/foo';
import { bar } from './bar';
import { foo } from './foo';

export default lodash.toUpper(foo + bar + foo2 + bar2);
