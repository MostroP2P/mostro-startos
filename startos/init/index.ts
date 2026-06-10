import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setupNostr } from '../actions/nostrSetup'
import { seedDefaults } from './seedDefaults'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  seedDefaults,
  setupNostr,
)

export const uninit = sdk.setupUninit(versionGraph)
