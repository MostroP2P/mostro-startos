import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(
  async ({ effects }: { effects: any }) => {
    let currentDeps = {} as Record<
      string,
      {
        kind: 'running'
        versionRange: string
        healthChecks: string[]
      }
    >

    currentDeps['lnd'] = {
      kind: 'running',
      versionRange: '>=0.18.3',
      healthChecks: ['sync-progress'],
    }

    return currentDeps
  },
)
