// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from 'fs';
import assert from 'node:assert';
import React from 'react';

export const debug = async () => {
  assert(fs, 'fs exists');
  console.log(React.version);
};
