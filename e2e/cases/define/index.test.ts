import { build } from '@rslib/core'
import { expect, test } from 'vitest'
import { globContentJSON } from '#helper'

test.fails('define', async () => {
  // @ts-expect-error follow conventional
  delete process.env.NODE_ENV

  const rslibConfig = {
    root: __dirname,
    entry: './js/src/index.js',
    outDir: 'dist',
  }

  const instance = await build(rslibConfig)
  const results = await globContentJSON(instance.context.distPath, {
    absolute: true,
    ignore: ['/**/*.map'],
  })

  const entryJs = Object.keys(results).find((file) => file.endsWith('.js'))
  expect(results[entryJs!]).not.toContain('console.info(VERSION)')
})
