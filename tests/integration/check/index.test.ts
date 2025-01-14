import { join } from 'node:path';
import stripAnsi from 'strip-ansi';
import { buildAndGetResults, proxyConsole } from 'test-helper';
import { expect, test } from 'vitest';

test('should receive JSX mismatch warning of SWC with tsconfig', async () => {
  const { logs, restore } = proxyConsole();
  const fixturePath = join(__dirname, 'jsx');
  await buildAndGetResults({ fixturePath });
  const logStrings = logs
    .map((log) => stripAnsi(log))
    .filter((log) => log.startsWith('warn'))
    .sort()
    .join('\n');

  expect(logStrings).toMatchInlineSnapshot(`
    "warn    JSX runtime is set to "automatic" in SWC, but got undefined in tsconfig.json. This may cause unexpected behavior, considering aligning them.
    warn    JSX runtime is set to "automatic" in SWC, but got undefined in tsconfig.json. This may cause unexpected behavior, considering aligning them."
  `);

  restore();
});
