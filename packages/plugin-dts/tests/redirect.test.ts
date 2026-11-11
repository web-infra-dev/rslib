import { logger } from '@rsbuild/core';
import { afterEach, describe, expect, rs, test } from '@rstest/core';
import type { MatchPath } from 'tsconfig-paths';
import { redirectDtsImports } from '../src/utils';

const dtsFile = '/project/dist/index.d.ts';

// Every relative import resolves to an existing declaration file, so
// `redirect.extension` adds `.js` to it.
const fileSystem = {
  readFile: async () => '',
  writeFile: async () => {},
  getFiles: async () => [],
  fileExists: async (file: string) => file.endsWith('.d.ts'),
  isDirectory: async () => false,
};

const matchPath: MatchPath = () => undefined;

const redirect = (content: string) =>
  redirectDtsImports(
    dtsFile,
    '.d.ts',
    { path: true, extension: true },
    matchPath,
    '/project/dist',
    '/project/src',
    content,
    fileSystem,
  );

describe('redirectDtsImports', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  test('should escape redirected specifiers for the original quote', async () => {
    expect(
      await redirect(
        ["import a from './it\\'s';", 'import b from "./say\\"hi";', ''].join(
          '\n',
        ),
      ),
    ).toBe(
      [
        "import a from './it\\'s.js';",
        'import b from "./say\\"hi.js";',
        '',
      ].join('\n'),
    );
  });

  test('should warn with the location and keep the content when parsing fails', async () => {
    const warn = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const content = "import a from './foo';\nexport const x: = 1;\n";

    expect(await redirect(content)).toBe(content);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain(`${dtsFile}:2:17`);
  });

  test('should redirect without warning when the program is recovered', async () => {
    const warn = rs.spyOn(logger, 'warn').mockImplementation(() => {});

    expect(
      await redirect(
        "import a from './foo';\nexport function f() { return 1; }\n",
      ),
    ).toBe("import a from './foo.js';\nexport function f() { return 1; }\n");
    expect(warn).not.toHaveBeenCalled();
  });
});
