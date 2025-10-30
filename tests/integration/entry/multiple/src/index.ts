import { foo } from './foo';
import { shared } from './shared';

export const text = () => `${foo} ${shared('index')}`;
