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
            'true': 'Enabled',
            'false': 'Disabled',
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
            rpc_enabled: rpcConfig.enabled ? 'true' as const : 'false' as const,
            rpc_listen_address: rpcConfig.listen_address,
            rpc_port: rpcConfig.port,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)
        const currentTomlConfig = await daemon_settings.read((s) => s).const(effects)

        // Prepare complete TOML config with updated RPC section
        const newTomlConfig = {
            lightning: currentTomlConfig?.lightning || {
                lnd_cert_file: '/home/user/.polar/networks/1/volumes/lnd/alice/tls.cert',
                lnd_macaroon_file: '/home/user/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
                lnd_grpc_host: 'https://127.0.0.1:10001',
                invoice_expiration_window: 3600,
                hold_invoice_cltv_delta: 144,
                hold_invoice_expiration_window: 300,
                payment_attempts: 3,
                payment_retries_interval: 60,
            },
            nostr: currentTomlConfig?.nostr || {
                relays: ['ws://localhost:7000'],
            },
            mostro: currentTomlConfig?.mostro || {
                fee: 0,
                max_routing_fee: 0.001,
                max_order_amount: 1000000,
                min_payment_amount: 100,
                expiration_hours: 24,
                max_expiration_days: 15,
                expiration_seconds: 900,
                user_rates_sent_interval_seconds: 3600,
                publish_relays_interval: 60,
                pow: 0,
                publish_mostro_info_interval: 300,
                bitcoin_price_api_url: 'https://api.yadio.io',
            },
            database: currentTomlConfig?.database || {
                url: 'sqlite://mostro.db',
            },
            rpc: {
                enabled: input.rpc_enabled === 'true',
                listen_address: input.rpc_listen_address,
                port: input.rpc_port,
            },
        }

        // Check if anything changed in TOML config
        const tomlChanged = !currentTomlConfig ||
            JSON.stringify(currentTomlConfig.rpc) !== JSON.stringify(newTomlConfig.rpc)

        // Ensure sensitive config exists (we might need to initialize it)
        if (!currentSensitiveConfig) {
            await storeJson.write(effects, {
                nsec_privkey: 'nsec1...',
                db_password: '',
            })
        }

        // Update TOML config if changed
        if (tomlChanged) {
            await daemon_settings.write(effects, newTomlConfig)
        }
    },
) 