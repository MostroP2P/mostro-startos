import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value } = sdk

function asEnabled(value: boolean | undefined, fallback: boolean) {
  return (value ?? fallback) ? ('true' as const) : ('false' as const)
}

export const inputSpec = InputSpec.of({
  enabled: Value.select({
    name: i18n('Payer History Enabled'),
    description: i18n(
      'Track payment-account history across trades (anti-triangulation). Off by default.',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  require_declaration: Value.select({
    name: i18n('Require Declare-Payer'),
    description: i18n(
      'When payer history is on, reject fiat-sent unless the buyer sent declare-payer first. Leave off unless your market needs sender-verifiable rails.',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  experienced_min_trades: Value.number({
    name: i18n('Experienced Min Trades'),
    description: i18n(
      'Successful undisputed trades a seller must already have with other buyers to count as experienced',
    ),
    default: 5,
    required: true,
    integer: true,
    min: 1,
    max: 1000,
  }),
  experienced_min_days: Value.number({
    name: i18n('Experienced Min Days'),
    description: i18n(
      'Days since that seller’s first such trade before it counts as experienced',
    ),
    default: 30,
    required: true,
    integer: true,
    min: 1,
    max: 3650,
  }),
})

export const payerHistorySettings = sdk.Action.withInput(
  'payer-history-settings',

  async () => ({
    name: i18n('Configure Payer History'),
    description: i18n(
      'Configure payment-account history and declare-payer requirements',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Trading'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const payer = await daemon_settings.read((s) => s?.payer_history).once()

    return {
      enabled: asEnabled(payer?.enabled, false),
      require_declaration: asEnabled(payer?.require_declaration, false),
      experienced_min_trades: payer?.experienced_min_trades ?? 5,
      experienced_min_days: payer?.experienced_min_days ?? 30,
    }
  },

  async ({ effects, input }) => {
    await daemon_settings.merge(effects, {
      payer_history: {
        enabled: input.enabled === 'true',
        require_declaration: input.require_declaration === 'true',
        experienced_min_trades: input.experienced_min_trades,
        experienced_min_days: input.experienced_min_days,
      },
    })
  },
)
