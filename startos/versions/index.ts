import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v0_14_1_0 } from './v0.14.1_0'
import { v0_14_2_0 } from './v0.14.2_0'
import { v0_14_3_0 } from './v0.14.3_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v0_14_3_0, v0_14_2_0, v0_14_1_0],
})
