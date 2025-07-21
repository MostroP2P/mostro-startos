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
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        const nostrConfig = tomlConfig?.nostr || {
            nsec_privkey: 'nsec1...',
            relays: ['ws://localhost:7000'],
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

        // Parse relays string to array
        const relaysArray = input.relays.split(',').map((relay: string) => relay.trim())

        // Prepare only the nostr section for TOML (now includes nsec_privkey)
        const nostrConfig = {
            nostr: {
                nsec_privkey: input.nsec_privkey,
                relays: relaysArray,
            },
        }

        // Ensure sensitive config exists with only db_password
        if (!currentSensitiveConfig) {
            await storeJson.write(effects, {
                db_password: '',
            })
        }

        // Update only the nostr section
        await daemon_settings.merge(effects, nostrConfig)
    },
) 