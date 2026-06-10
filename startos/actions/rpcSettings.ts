import { storeJson } from '../fileModels/store.json'
import { daemon_settings } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  rpc_enabled: Value.select({
    name: 'RPC Server Enabled',
    description: 'Enable RPC server for direct admin communication',
    default: 'false',
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  }),
  rpc_listen_address: Value.text({
    name: 'RPC Listen Address',
    description: 'RPC server listen address',
    placeholder: '127.0.0.1',
    default: '127.0.0.1',
    required: true,
  }),
  rpc_port: Value.number({
    name: 'RPC Port',
    description: 'RPC server port',
    default: 50051,
    required: true,
    integer: true,
    min: 1024,
    max: 65535,
  }),
})

export const rpcSettings = sdk.Action.withInput(
  'rpc-settings',

  async () => ({
    name: i18n('Configure RPC Settings'),
    description: i18n('Configure RPC server settings for administrative access'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Mostro'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const rpcConfig = await daemon_settings.read((s) => s?.rpc).once()

    return {
      rpc_enabled: rpcConfig?.enabled ? ('true' as const) : ('false' as const),
      rpc_listen_address: rpcConfig?.listen_address ?? '127.0.0.1',
      rpc_port: rpcConfig?.port ?? 50051,
    }
  },

  async ({ effects, input }) => {
    const configured = await storeJson.read((s) => s?.nostrKeysConfigured).once()
    if (configured === null) {
      await storeJson.merge(effects, { nostrKeysConfigured: false })
    }

    await daemon_settings.merge(effects, {
      rpc: {
        enabled: input.rpc_enabled === 'true',
        listen_address: input.rpc_listen_address,
        port: input.rpc_port,
      },
    })
  },
)
