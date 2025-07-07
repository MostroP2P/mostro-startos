import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
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
})

export const nostrSettings = sdk.Action.withInput(
    'nostr-settings',

    async ({ effects }) => ({
        name: 'Configure Nostr Settings',
        description: 'Configure Nostr settings for Mostro',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const sensitiveConfig = await storeJson.read((s) => s).const(effects)
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        // Parse relays array back to comma-separated string
        const relaysString = tomlConfig?.nostr?.relays?.join(',') || 'ws://localhost:7000'

        return {
            // Sensitive data from storeJson
            nsec_privkey: sensitiveConfig?.nsec_privkey || 'nsec1...',
            // Non-sensitive data from TOML
            relays: relaysString,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)
        const currentTomlConfig = await daemon_settings.read((s) => s).const(effects)

        // Parse relays string to array
        const relaysArray = input.relays.split(',').map((relay: string) => relay.trim())

        // Prepare sensitive data for storeJson
        const newSensitiveConfig = {
            nsec_privkey: input.nsec_privkey,
            db_password: currentSensitiveConfig?.db_password || '',
        }

        // Prepare complete TOML config with defaults
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
            nostr: {
                relays: relaysArray,
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

        // Check if anything changed in sensitive config
        const sensitiveChanged = !currentSensitiveConfig ||
            currentSensitiveConfig.nsec_privkey !== newSensitiveConfig.nsec_privkey

        // Check if anything changed in TOML config
        const tomlChanged = !currentTomlConfig ||
            JSON.stringify(currentTomlConfig.nostr?.relays) !== JSON.stringify(relaysArray)

        // Update sensitive data if changed
        if (sensitiveChanged) {
            await storeJson.write(effects, newSensitiveConfig)
        }

        // Update TOML config if changed
        if (tomlChanged) {
            await daemon_settings.write(effects, newTomlConfig)
        }
    },
) 