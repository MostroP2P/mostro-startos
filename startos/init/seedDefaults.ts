import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { daemon_settings } from '../fileModels/settings'

export const seedDefaults = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {})
  await daemon_settings.merge(effects, {})
})
