import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
    // Database configuration
    database_url: Value.text({
        name: 'Database URL',
        description: 'Database connection URL',
        placeholder: 'sqlite://mostro.db',
        default: 'sqlite://mostro.db',
        required: true,
    }),
})

export const databaseSettings = sdk.Action.withInput(
    'database-settings',

    async ({ effects }) => ({
        name: 'Configure Database Settings',
        description: 'Configure database connection settings for Mostro',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        const databaseConfig = tomlConfig?.database || {
            url: 'sqlite://mostro.db',
        }

        return {
            database_url: databaseConfig.url,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)
        const currentTomlConfig = await daemon_settings.read((s) => s).const(effects)

        // Prepare complete TOML config with updated database section
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
            database: {
                url: input.database_url,
            },
            rpc: currentTomlConfig?.rpc || {
                enabled: false,
                listen_address: '127.0.0.1',
                port: 50051,
            },
        }

        // Check if anything changed in TOML config
        const tomlChanged = !currentTomlConfig ||
            currentTomlConfig.database?.url !== input.database_url

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