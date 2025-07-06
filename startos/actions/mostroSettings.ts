import { storeJson } from '../file-models/store.json'
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

    // Nostr configuration
    nsec_privkey: Value.text({
        name: 'Nostr Private Key',
        description: 'Nostr private key (nsec format)',
        placeholder: 'nsec1...',
        default: 'nsec1...',
        required: true,
    }),
    relays: Value.text({
        name: 'Nostr Relays',
        description: 'Comma-separated list of Nostr relay URLs',
        placeholder: 'ws://localhost:7000',
        default: 'ws://localhost:7000',
        required: true,
    }),

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

    // Database configuration
    database_url: Value.text({
        name: 'Database URL',
        description: 'Database connection URL',
        placeholder: 'sqlite://mostro.db',
        default: 'sqlite://mostro.db',
        required: true,
    }),

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

export const mostroSettings = sdk.Action.withInput(
    'mostro-settings',

    async ({ effects }) => ({
        name: 'Configure Mostro Settings',
        description: 'Configure Lightning node connection settings for Mostro',
        warning: null,
        allowedStatuses: 'any',
        group: null,
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const config = await storeJson.read((s) => s).const(effects)

        if (!config) {
            // Return default values if no config exists
            return {
                // Lightning configuration
                lnd_cert_file: '/home/user/.polar/networks/1/volumes/lnd/alice/tls.cert',
                lnd_macaroon_file: '/home/user/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
                lnd_grpc_host: 'https://127.0.0.1:10001',
                invoice_expiration_window: 3600,
                hold_invoice_cltv_delta: 144,
                hold_invoice_expiration_window: 300,
                payment_attempts: 3,
                payment_retries_interval: 60,

                // Nostr configuration
                nsec_privkey: 'nsec1...',
                relays: 'ws://localhost:7000',

                // Mostro configuration
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

                // Database configuration
                database_url: 'sqlite://mostro.db',

                // RPC configuration
                rpc_enabled: 'false' as const,
                rpc_listen_address: '127.0.0.1',
                rpc_port: 50051,
            }
        }

        // Parse relays array back to comma-separated string
        const relaysString = config.nostr?.relays?.join(',') || 'ws://localhost:7000'

        return {
            // Lightning configuration
            lnd_cert_file: config.lightning?.lnd_cert_file || '/home/user/.polar/networks/1/volumes/lnd/alice/tls.cert',
            lnd_macaroon_file: config.lightning?.lnd_macaroon_file || '/home/user/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon',
            lnd_grpc_host: config.lightning?.lnd_grpc_host || 'https://127.0.0.1:10001',
            invoice_expiration_window: config.lightning?.invoice_expiration_window || 3600,
            hold_invoice_cltv_delta: config.lightning?.hold_invoice_cltv_delta || 144,
            hold_invoice_expiration_window: config.lightning?.hold_invoice_expiration_window || 300,
            payment_attempts: config.lightning?.payment_attempts || 3,
            payment_retries_interval: config.lightning?.payment_retries_interval || 60,

            // Nostr configuration
            nsec_privkey: config.nostr?.nsec_privkey || 'nsec1...',
            relays: relaysString,

            // Mostro configuration
            fee: config.mostro?.fee || 0,
            max_routing_fee: config.mostro?.max_routing_fee || 0.001,
            max_order_amount: config.mostro?.max_order_amount || 1000000,
            min_payment_amount: config.mostro?.min_payment_amount || 100,
            expiration_hours: config.mostro?.expiration_hours || 24,
            max_expiration_days: config.mostro?.max_expiration_days || 15,
            expiration_seconds: config.mostro?.expiration_seconds || 900,
            user_rates_sent_interval_seconds: config.mostro?.user_rates_sent_interval_seconds || 3600,
            publish_relays_interval: config.mostro?.publish_relays_interval || 60,
            pow: config.mostro?.pow || 0,
            publish_mostro_info_interval: config.mostro?.publish_mostro_info_interval || 300,
            bitcoin_price_api_url: config.mostro?.bitcoin_price_api_url || 'https://api.yadio.io',

            // Database configuration
            database_url: config.database?.url || 'sqlite://mostro.db',

            // RPC configuration
            rpc_enabled: config.rpc?.enabled ? 'true' as const : 'false' as const,
            rpc_listen_address: config.rpc?.listen_address || '127.0.0.1',
            rpc_port: config.rpc?.port || 50051,
        }
    },

    async ({ effects, input }) => {
        const currentConfig = await storeJson.read((s) => s).const(effects)

        // Parse relays string to array
        const relaysArray = input.relays.split(',').map((relay: string) => relay.trim())

        // Create new configuration
        const newConfig = {
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
            nostr: {
                nsec_privkey: input.nsec_privkey,
                relays: relaysArray,
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
            database: {
                url: input.database_url,
            },
            rpc: {
                enabled: input.rpc_enabled === 'true',
                listen_address: input.rpc_listen_address,
                port: input.rpc_port,
            },
        }

        // Check if anything changed by comparing with current config
        if (currentConfig &&
            JSON.stringify(currentConfig.lightning) === JSON.stringify(newConfig.lightning) &&
            JSON.stringify(currentConfig.nostr) === JSON.stringify(newConfig.nostr) &&
            JSON.stringify(currentConfig.mostro) === JSON.stringify(newConfig.mostro) &&
            JSON.stringify(currentConfig.database) === JSON.stringify(newConfig.database) &&
            JSON.stringify(currentConfig.rpc) === JSON.stringify(newConfig.rpc)) {
            return
        }

        // Update the store with new configuration
        await storeJson.merge(effects, newConfig)
    },
) 