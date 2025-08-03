import { storeJson } from '../file-models/store.json'
import { nostrSettings } from './nostrSettings'
import { sdk } from '../sdk'

export const setupNostr = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const nostrKeysConfigured = (await storeJson.read().once())
    ?.nostrKeysConfigured

  if (!nostrKeysConfigured) {
    await sdk.action.createOwnTask(effects, nostrSettings, 'critical', {
      reason: 'Mostro needs Nostr keys to function properly',
    })
  }
})
