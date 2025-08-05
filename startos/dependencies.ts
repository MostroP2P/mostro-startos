import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(
  async ({ effects }: { effects: any }) => {
    let lnd = {
      kind: 'running' as const,
      versionRange: '>=0.18.3',
      healthChecks: ['sync-progress'],
    }

    return {
      lnd,
    }
  },
)
