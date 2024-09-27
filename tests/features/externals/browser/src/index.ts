import fs from 'fs'; // Should not be resolved when target is not "node"
import assert from 'node:assert'; // Should not be resolved when target is not "node"

export const foo = () => {
  assert(fs, 'fs exists');
};
