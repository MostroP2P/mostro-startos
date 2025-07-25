import { sdk } from '../sdk'
import { lnSettings } from './lnSettings'
import { nostrSettings } from './nostrSettings'
import { mostroSettings } from './mostroSettings'
import { rpcSettings } from './rpcSettings'
import { databaseSettings } from './databaseSettings'
import { dbPasswordRequiredSettings } from './databaseSettings'

export const actions = sdk.Actions.of()
    .addAction(lnSettings)
    .addAction(nostrSettings)
    .addAction(mostroSettings)
    .addAction(rpcSettings)
    .addAction(databaseSettings)
    .addAction(dbPasswordRequiredSettings)
