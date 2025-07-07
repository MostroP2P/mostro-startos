import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
    // Lightning configuration
    lnd_cert_file: Value.text({
        name: 'LND Certificate File',
        description: 'Path to tls.cert file',
        placeholder: '/home/user/.polar/networks/1/volumes/lnd/alice/tls.cert',
        default: '/home/user/.polar/networks/1/volumes/lnd/alice/tls.cert',
        required: true,
    }),
    lnd_macaroon_file: Value.text({
        name: 'LND Macaroon File',
        description: 'Path to macaroon file',
        placeholder: '/home/user/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
        default: '/home/user/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
        required: true,
    }),
    lnd_grpc_host: Value.text({
        name: 'LND gRPC Host',
        description: 'LND gRPC host and port',
        placeholder: 'https://127.0.0.1:10001',
        default: 'https://127.0.0.1:10001',
        required: true,
    }),
    invoice_expiration_window: Value.number({
        name: 'Invoice Expiration Window',
        description: 'Lightning invoices sent by the buyer to Mostro should have at least this expiration time in seconds',
        default: 3600,
        required: true,
        integer: true,
        min: 300,
        max: 86400,
    }),
    hold_invoice_cltv_delta: Value.number({
        name: 'Hold Invoice CLTV Delta',
        description: 'Hold invoice cltv delta (expiration time in blocks)',
        default: 144,
        required: true,
        integer: true,
        min: 1,
        max: 1000,
    }),
    hold_invoice_expiration_window: Value.number({
        name: 'Hold Invoice Expiration Window',
        description: 'This is the time that a taker has to pay the invoice (seller) or to add a new invoice (buyer), in seconds',
        default: 300,
        required: true,
        integer: true,
        min: 60,
        max: 3600,
    }),
    payment_attempts: Value.number({
        name: 'Payment Attempts',
        description: 'Retries for failed payments',
        default: 3,
        required: true,
        integer: true,
        min: 1,
        max: 10,
    }),
    payment_retries_interval: Value.number({
        name: 'Payment Retries Interval',
        description: 'Retries interval for failed payments in seconds',
        default: 60,
        required: true,
        integer: true,
        min: 10,
        max: 300,
    }),
})

export const lnSettings = sdk.Action.withInput(
    'ln-settings',

    async ({ effects }) => ({
        name: 'Configure Lightning Node Settings',
        description: 'Configure Lightning node connection settings for Mostro',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        const lightningConfig = tomlConfig?.lightning || {
            lnd_cert_file: '/home/user/.polar/networks/1/volumes/lnd/alice/tls.cert',
            lnd_macaroon_file: '/home/user/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
            lnd_grpc_host: 'https://127.0.0.1:10001',
            invoice_expiration_window: 3600,
            hold_invoice_cltv_delta: 144,
            hold_invoice_expiration_window: 300,
            payment_attempts: 3,
            payment_retries_interval: 60,
        }

        return {
            lnd_cert_file: lightningConfig.lnd_cert_file,
            lnd_macaroon_file: lightningConfig.lnd_macaroon_file,
            lnd_grpc_host: lightningConfig.lnd_grpc_host,
            invoice_expiration_window: lightningConfig.invoice_expiration_window,
            hold_invoice_cltv_delta: lightningConfig.hold_invoice_cltv_delta,
            hold_invoice_expiration_window: lightningConfig.hold_invoice_expiration_window,
            payment_attempts: lightningConfig.payment_attempts,
            payment_retries_interval: lightningConfig.payment_retries_interval,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)
        const currentTomlConfig = await daemon_settings.read((s) => s).const(effects)

        // Prepare complete TOML config with updated lightning section
        const newTomlConfig = {
            lightning: {
                lnd_cert_file: input.lnd_cert_file,
                lnd_macaroon_file: input.lnd_macaroon_file,
                lnd_grpc_host: input.lnd_grpc_host,
                invoice_expiration_window: input.invoice_expiration_window,
                hold_invoice_cltv_delta: input.hold_invoice_cltv_delta,
                hold_invoice_expiration_window: input.hold_invoice_expiration_window,
                payment_attempts: input.payment_attempts,
                payment_retries_interval: input.payment_retries_interval,
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
            rpc: currentTomlConfig?.rpc || {
                enabled: false,
                listen_address: '127.0.0.1',
                port: 50051,
            },
        }

        // Check if anything changed in TOML config
        const tomlChanged = !currentTomlConfig ||
            JSON.stringify(currentTomlConfig.lightning) !== JSON.stringify(newTomlConfig.lightning)

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