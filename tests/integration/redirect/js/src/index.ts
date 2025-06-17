// can not be resolved
import lodash from 'lodash';
// can be resolved, 3rd packages
import merge from 'lodash.merge';
// can be resolved but not specified -- phantom dependency
import prettier from 'prettier';

import { bar as bar2 } from '@/bar';
import { foo as foo2 } from '@/foo';
// @ts-expect-error test case for unresolved paths import
import { baz } from '~/baz';
import { bar } from './bar';
import { foo } from './foo';

export default lodash.toUpper(
  merge(foo) + bar + foo2 + bar2 + baz + typeof prettier.version,
);
