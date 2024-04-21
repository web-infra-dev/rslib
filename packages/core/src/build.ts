import { createRsbuild } from '@rsbuild/core'
import { composeCreateRsbuildConfig } from './config'
import type { RslibConfig } from './types'

export async function build(config: RslibConfig) {
  const createRsbuildConfig = composeCreateRsbuildConfig(config)
  const rsbuildInstance = await createRsbuild(createRsbuildConfig)
  await rsbuildInstance.build({
    mode: 'production',
  })
  return rsbuildInstance
}
