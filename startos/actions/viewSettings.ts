import { FileHelper } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const settingsRaw = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './settings.toml',
})

const REDACTED_NSEC = '[redacted]'

export function redactSettingsToml(content: string): string {
  return content
    .replace(
      /^(\s*nsec_privkey\s*=\s*)'[^']*'/gm,
      `$1'${REDACTED_NSEC}'`,
    )
    .replace(
      /^(\s*nsec_privkey\s*=\s*)"[^"]*"/gm,
      `$1"${REDACTED_NSEC}"`,
    )
}

export const inputSpec = InputSpec.of({
  content: Value.textarea({
    name: 'settings.toml',
    description: i18n('Current configuration on disk:'),
    footnote: i18n(
      'Read-only. Re-run this action after changing settings to refresh.',
    ),
    default: '',
    required: false,
    minRows: 24,
    maxRows: 40,
    immutable: true,
  }),
})

export const viewSettings = sdk.Action.withInput(
  'view-settings',

  async () => ({
    name: i18n('View settings.toml'),
    description: i18n(
      'Show the current Mostro configuration file (Nostr secret redacted)',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Mostro'),
    visibility: 'enabled',
  }),

  inputSpec,

  async () => {
    const raw =
      (await settingsRaw.read().once()) ?? '(settings.toml not created yet)'
    return { content: redactSettingsToml(raw) }
  },

  async () => {},
)
