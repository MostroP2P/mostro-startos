import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'


export const setDependencies = sdk.setupDependencies(async ({ effects }) => {

  const ln = await storeJson.read((s) => s.lightning).const(effects)
  if (!ln) throw new Error('Lightning not found in store')

  let currentDeps = {} as Record<
    'bitcoind' | 'lnd' | 'c-lightning',
    T.DependencyRequirement
  >

  if (ln === 'lnd') {
    currentDeps['lnd'] = {
      id: 'lnd',
      kind: 'running',
      versionRange: '>=0.18.3',
      healthChecks: [],
    }
  }

  if (ln === 'cln') {
    currentDeps['c-lightning'] = {
      id: 'c-lightning',
      kind: 'running',
      versionRange: '>=24.08.1:1', // @TODO confirm
      healthChecks: [],
    }
    }
  

  return {
    ...currentDeps,
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.0.0:1',
      healthChecks: [],
    },
  }
})
