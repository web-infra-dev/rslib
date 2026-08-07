import { queryTarget as extensionlessQueryTarget } from './query-target?query';
import { queryTarget as tsQueryTarget } from './query-target.ts?query';

export const query = extensionlessQueryTarget + tsQueryTarget;
