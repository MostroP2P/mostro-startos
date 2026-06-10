import { storeJson } from '../fileModels/store.json'
import { daemon_settings } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  invoice_expiration_window: Value.number({
    name: 'Invoice Expiration Window',
    description:
      'Lightning invoices sent by the buyer to Mostro should have at least this expiration time in seconds',
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
    description:
      'This is the time that a taker has to pay the invoice (seller) or to add a new invoice (buyer), in seconds',
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

  async () => ({
    name: i18n('Configure Lightning Node Settings'),
    description: i18n('Configure Lightning node connection settings for Mostro'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Mostro'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const lightningConfig = await daemon_settings
      .read((s) => s?.lightning)
      .once()

    return {
      invoice_expiration_window: lightningConfig?.invoice_expiration_window ?? 3600,
      hold_invoice_cltv_delta: lightningConfig?.hold_invoice_cltv_delta ?? 144,
      hold_invoice_expiration_window:
        lightningConfig?.hold_invoice_expiration_window ?? 300,
      payment_attempts: lightningConfig?.payment_attempts ?? 3,
      payment_retries_interval:
        lightningConfig?.payment_retries_interval ?? 60,
    }
  },

  async ({ effects, input }) => {
    const store = await storeJson.read((s) => s?.nostrKeysConfigured).once()
    if (store === null) {
      await storeJson.merge(effects, { nostrKeysConfigured: false })
    }

    await daemon_settings.merge(effects, {
      lightning: {
        lnd_cert_file: '/lnd/tls.cert',
        lnd_macaroon_file: '/lnd/data/chain/bitcoin/mainnet/admin.macaroon',
        lnd_grpc_host: 'https://lnd.startos:10009',
        invoice_expiration_window: input.invoice_expiration_window,
        hold_invoice_cltv_delta: input.hold_invoice_cltv_delta,
        hold_invoice_expiration_window: input.hold_invoice_expiration_window,
        payment_attempts: input.payment_attempts,
        payment_retries_interval: input.payment_retries_interval,
      },
    })
  },
)
