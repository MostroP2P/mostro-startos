import { storeJson } from '../fileModels/store.json'
import { daemon_settings } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { isValidNsec, validateRelayList } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  nsec_privkey: Value.text({
    name: 'Nostr Private Key',
    description:
      'Nostr private key in nsec format (e.g., nsec1abc123...). Must start with "nsec1" and be a valid Bech32-encoded private key.',
    placeholder: 'nsec1...',
    default: 'nsec1...',
    required: true,
  }),
  relays: Value.text({
    name: 'Nostr Relays',
    description:
      'Comma-separated list of Nostr relay URLs (e.g., wss://relay.mostro.network, ws://localhost:7000). Must use ws:// or wss:// protocol.',
    placeholder: 'wss://relay.mostro.network',
    default: 'wss://relay.mostro.network',
    required: true,
  }),
})

export const nostrSettings = sdk.Action.withInput(
  'nostr-settings',

  async () => ({
    name: i18n('Configure Nostr Settings'),
    description: i18n('Configure Nostr settings for Mostro'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Mostro'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const nostrConfig = await daemon_settings.read((s) => s?.nostr).once()

    return {
      nsec_privkey: nostrConfig?.nsec_privkey ?? '',
      relays: (nostrConfig?.relays ?? ['wss://relay.mostro.network']).join(','),
    }
  },

  async ({ effects, input }) => {
    if (!isValidNsec(input.nsec_privkey)) {
      throw new Error(
        'Invalid Nostr private key format. Please provide a valid nsec1... key.',
      )
    }

    const validRelays = validateRelayList(input.relays)
    if (validRelays.length === 0) {
      throw new Error(
        'No valid relay URLs provided. Please provide at least one valid relay URL (ws:// or wss://).',
      )
    }

    await storeJson.merge(effects, { nostrKeysConfigured: true })

    await daemon_settings.merge(effects, {
      nostr: {
        nsec_privkey: input.nsec_privkey,
        relays: validRelays,
      },
    })
  },
)
