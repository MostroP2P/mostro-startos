import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'
import { isValidNsec, validateRelayList } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
    // Nostr configuration
    nsec_privkey: Value.text({
        name: 'Nostr Private Key',
        description: 'Nostr private key in nsec format (e.g., nsec1abc123...). Must start with "nsec1" and be a valid Bech32-encoded private key.',
        placeholder: 'nsec1...',
        default: 'nsec1...',
        required: true,
    }),
    relays: Value.text({
        name: 'Nostr Relays',
        description: 'Comma-separated list of Nostr relay URLs (e.g., wss://relay.mostro.network, ws://localhost:7000). Must use ws:// or wss:// protocol.',
        placeholder: 'wss://relay.mostro.network',
        default: 'wss://relay.mostro.network',
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
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        const nostrConfig = tomlConfig?.nostr || {
            nsec_privkey: 'nsec1...',
            relays: ['wss://relay.mostro.network'],
        }

        // Parse relays array back to comma-separated string
        const relaysString = nostrConfig.relays.join(',')

        return {
            nsec_privkey: nostrConfig.nsec_privkey,
            relays: relaysString,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)

        // Validate Nostr private key
        if (!isValidNsec(input.nsec_privkey)) {
            throw new Error('Invalid Nostr private key format. Please provide a valid nsec1... key.')
        }

        // Validate relay URLs
        const validRelays = validateRelayList(input.relays)
        if (validRelays.length === 0) {
            throw new Error('No valid relay URLs provided. Please provide at least one valid relay URL (ws:// or wss://).')
        }

        // Prepare only the nostr section for TOML (now includes nsec_privkey)
        const nostrConfig = {
            nostr: {
                nsec_privkey: input.nsec_privkey,
                relays: validRelays,
            },
        }

        // Ensure sensitive config exists and mark Nostr keys as configured
        if (!currentSensitiveConfig) {
            await storeJson.write(effects, {
                db_password_required: false,
                db_password: '',
                nostrKeysConfigured: true,
            })
        } else {
            // Update existing config to mark Nostr keys as configured
            await storeJson.merge(effects, {
                nostrKeysConfigured: true,
            })
        }

        // Update only the nostr section
        await daemon_settings.merge(effects, nostrConfig)
    },
) 