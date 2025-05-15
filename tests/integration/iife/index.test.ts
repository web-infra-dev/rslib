import { buildAndGetResults } from 'test-helper';
import { expect, test } from 'vitest';

declare global {
  var globalHelper: any;
  var addPrefix: any;
}

test('iife', async () => {
  process.env.NODE_ENV = 'production';
  const fixturePath = __dirname;
  const { entryFiles, entries } = await buildAndGetResults({
    fixturePath,
  });

  globalThis.globalHelper = { helperName: 'HELPER_NAME' };
  require(entryFiles.iife);
  console.log(globalThis.globalHelper);
  expect(globalThis.addPrefix('ok')).toBe('production: HELPER_NAMEok');
  delete process.env.NODE_ENV;
  delete globalThis.globalHelper;

  expect(entries.iife).toMatchInlineSnapshot(
    `
    "(()=>{
        "use strict";
        const external_globalHelper_namespaceObject = globalThis.globalHelper;
        const addPrefix = (prefix, str, env)=>\`\${env}: \${prefix}\${str}\`;
        globalThis.addPrefix = (str)=>addPrefix(external_globalHelper_namespaceObject.helperName, str, "production");
    })();
    "
  `,
  );
});

test('throw error when using iife with `bundle: false`', async () => {
  const fixturePath = __dirname;
  const build = buildAndGetResults({
    fixturePath,
    configPath: './rslibBundleFalse.config.ts',
  });

  await expect(build).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: When using "iife" format, "bundle" must be set to "true". Since the default value for "bundle" is "true", so you can either explicitly set it to "true" or remove the field entirely.]`,
  );
});
