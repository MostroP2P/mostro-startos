import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  // RPC configuration
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

  async ({ effects }) => ({
    name: 'Configure RPC Settings',
    description: 'Configure RPC server settings for administrative access',
    warning: null,
    allowedStatuses: 'any',
    group: 'Mostro',
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const tomlConfig = await daemon_settings.read((s) => s).const(effects)

    const rpcConfig = tomlConfig?.rpc || {
      enabled: false,
      listen_address: '127.0.0.1',
      port: 50051,
    }

    return {
      rpc_enabled: rpcConfig.enabled ? ('true' as const) : ('false' as const),
      rpc_listen_address: rpcConfig.listen_address,
      rpc_port: rpcConfig.port,
    }
  },

  async ({ effects, input }) => {
    const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)

    // Prepare only the rpc section
    const rpcConfig = {
      rpc: {
        enabled: input.rpc_enabled === 'true',
        listen_address: input.rpc_listen_address,
        port: input.rpc_port,
      },
    }

    // Ensure sensitive config exists
    if (!currentSensitiveConfig) {
      await storeJson.write(effects, {
        db_password_required: false,
        db_password: '',
        nostrKeysConfigured: false,
      })
    }

    // Update only the rpc section
    await daemon_settings.merge(effects, rpcConfig)
  },
)
