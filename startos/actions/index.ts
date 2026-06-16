import { sdk } from '../sdk'
import { antiAbuseBondSettings } from './antiAbuseBondSettings'
import { expirationSettings } from './expirationSettings'
import { lnSettings } from './lnSettings'
import { nostrSettings } from './nostrSettings'
import { mostroSettings } from './mostroSettings'
import { rpcSettings } from './rpcSettings'
export const actions = sdk.Actions.of()
  .addAction(lnSettings)
  .addAction(nostrSettings)
  .addAction(mostroSettings)
  .addAction(expirationSettings)
  .addAction(antiAbuseBondSettings)
  .addAction(rpcSettings)
