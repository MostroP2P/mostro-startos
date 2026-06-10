import { storeJson } from '../fileModels/store.json'
import { nostrSettings } from './nostrSettings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const setupNostr = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const nostrKeysConfigured = (await storeJson
    .read((s) => s?.nostrKeysConfigured)
    .once()) ?? false

  if (!nostrKeysConfigured) {
    await sdk.action.createOwnTask(effects, nostrSettings, 'critical', {
      reason: i18n('Mostro needs Nostr keys to function properly'),
    })
  }
})
