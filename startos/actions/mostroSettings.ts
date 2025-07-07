import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
    // Mostro configuration
    fee: Value.number({
        name: 'Mostro Fee',
        description: 'Mostro fee percentage',
        default: 0,
        required: true,
        integer: false,
        min: 0,
        max: 1,
    }),
    max_routing_fee: Value.number({
        name: 'Max Routing Fee',
        description: 'Max routing fee that we want to pay to the network (0.001 = 0.1%)',
        default: 0.001,
        required: true,
        integer: false,
        min: 0,
        max: 0.1,
    }),
    max_order_amount: Value.number({
        name: 'Max Order Amount',
        description: 'Max order amount in satoshis',
        default: 1000000,
        required: true,
        integer: true,
        min: 1000,
        max: 100000000,
    }),
    min_payment_amount: Value.number({
        name: 'Min Payment Amount',
        description: 'Minimum amount for a payment in satoshis',
        default: 100,
        required: true,
        integer: true,
        min: 1,
        max: 10000,
    }),
    expiration_hours: Value.number({
        name: 'Expiration Hours',
        description: 'Default expiration time for orders in hours',
        default: 24,
        required: true,
        integer: true,
        min: 1,
        max: 168,
    }),
    max_expiration_days: Value.number({
        name: 'Max Expiration Days',
        description: 'Maximum expiration days for an order',
        default: 15,
        required: true,
        integer: true,
        min: 1,
        max: 365,
    }),
    expiration_seconds: Value.number({
        name: 'Expiration Seconds',
        description: 'Expiration of pending orders in seconds',
        default: 900,
        required: true,
        integer: true,
        min: 60,
        max: 3600,
    }),
    user_rates_sent_interval_seconds: Value.number({
        name: 'User Rates Interval',
        description: 'User rate events scheduled time interval in seconds',
        default: 3600,
        required: true,
        integer: true,
        min: 300,
        max: 86400,
    }),
    publish_relays_interval: Value.number({
        name: 'Publish Relays Interval',
        description: 'Relay list event time interval in seconds',
        default: 60,
        required: true,
        integer: true,
        min: 10,
        max: 3600,
    }),
    pow: Value.number({
        name: 'Proof of Work',
        description: 'Requested proof of work difficulty',
        default: 0,
        required: true,
        integer: true,
        min: 0,
        max: 40,
    }),
    publish_mostro_info_interval: Value.number({
        name: 'Publish Mostro Info Interval',
        description: 'Publish mostro info interval in seconds',
        default: 300,
        required: true,
        integer: true,
        min: 60,
        max: 3600,
    }),
    bitcoin_price_api_url: Value.text({
        name: 'Bitcoin Price API URL',
        description: 'Bitcoin price API base URL',
        placeholder: 'https://api.yadio.io',
        default: 'https://api.yadio.io',
        required: true,
    }),
})

export const mostroSettings = sdk.Action.withInput(
    'mostro-settings',

    async ({ effects }) => ({
        name: 'Configure Mostro Settings',
        description: 'Configure Mostro trading and business logic settings',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        const mostroConfig = tomlConfig?.mostro || {
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
        }

        return {
            fee: mostroConfig.fee,
            max_routing_fee: mostroConfig.max_routing_fee,
            max_order_amount: mostroConfig.max_order_amount,
            min_payment_amount: mostroConfig.min_payment_amount,
            expiration_hours: mostroConfig.expiration_hours,
            max_expiration_days: mostroConfig.max_expiration_days,
            expiration_seconds: mostroConfig.expiration_seconds,
            user_rates_sent_interval_seconds: mostroConfig.user_rates_sent_interval_seconds,
            publish_relays_interval: mostroConfig.publish_relays_interval,
            pow: mostroConfig.pow,
            publish_mostro_info_interval: mostroConfig.publish_mostro_info_interval,
            bitcoin_price_api_url: mostroConfig.bitcoin_price_api_url,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)
        const currentTomlConfig = await daemon_settings.read((s) => s).const(effects)

        // Prepare complete TOML config with updated mostro section
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
            mostro: {
                fee: input.fee,
                max_routing_fee: input.max_routing_fee,
                max_order_amount: input.max_order_amount,
                min_payment_amount: input.min_payment_amount,
                expiration_hours: input.expiration_hours,
                max_expiration_days: input.max_expiration_days,
                expiration_seconds: input.expiration_seconds,
                user_rates_sent_interval_seconds: input.user_rates_sent_interval_seconds,
                publish_relays_interval: input.publish_relays_interval,
                pow: input.pow,
                publish_mostro_info_interval: input.publish_mostro_info_interval,
                bitcoin_price_api_url: input.bitcoin_price_api_url,
            },
            database: currentTomlConfig?.database || {
                url: 'sqlite://mostro.db',
            },
            rpc: currentTomlConfig?.rpc || {
                enabled: false,
                listen_address: '127.0.0.1',
                port: 50051,
            },
        }

        // Check if anything changed in TOML config
        const tomlChanged = !currentTomlConfig ||
            JSON.stringify(currentTomlConfig.mostro) !== JSON.stringify(newTomlConfig.mostro)

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