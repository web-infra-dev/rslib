import path from 'node:path';
import color from 'picocolors';

/**
 * Node.js built-in modules.
 * Copied from https://github.com/webpack/webpack/blob/dd44b206a9c50f4b4cb4d134e1a0bd0387b159a3/lib/node/NodeTargetPlugin.js#L12-L72
 */
export const nodeBuiltInModules = [
  'assert',
  'assert/strict',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'inspector/promises',
  'module',
  'net',
  'os',
  'path',
  'path/posix',
  'path/win32',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'readline/promises',
  'repl',
  'stream',
  'stream/consumers',
  'stream/promises',
  'stream/web',
  'string_decoder',
  'sys',
  'timers',
  'timers/promises',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'util/types',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
  /^node:/,

  // cspell:word pnpapi
  // Yarn PnP adds pnpapi as "builtin"
  'pnpapi',
];

function calcLongestCommonPath(absPaths: string[]): string | null {
  if (absPaths.length === 0) {
    return null;
  }

  const splitPaths = absPaths.map((p) => p.split(path.sep));
  let lca = splitPaths[0]!;
  for (let i = 1; i < splitPaths.length; i++) {
    const currentPath = splitPaths[i]!;
    const minLength = Math.min(lca.length, currentPath.length);

    let j = 0;
    while (j < minLength && lca[j] === currentPath[j]) {
      j++;
    }

    lca = lca.slice(0, j);
  }

  return lca.length > 0 ? lca.join(path.sep) : '/';
}

export { color, calcLongestCommonPath };
