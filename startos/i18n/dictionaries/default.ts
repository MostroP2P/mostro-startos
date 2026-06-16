export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Mostro!': 0,
  'Mostro': 1,
  'Configure Lightning Node Settings': 2,
  'Configure Lightning node connection settings for Mostro': 3,
  'Configure Nostr Settings': 4,
  'Configure Nostr settings for Mostro': 5,
  'Configure Mostro Settings': 6,
  'Configure Mostro trading and business logic settings': 7,
  'Configure RPC Settings': 8,
  'Configure RPC server settings for administrative access': 9,
  'Mostro needs Nostr keys to function properly': 10,
  'RPC Version Check': 11,
  'Configure Event Expiration': 12,
  'Configure how long different Nostr event types are retained': 13,
  'Configure Anti-Abuse Bond': 14,
  'Configure Lightning hold-invoice bonds to deter abusive takers and makers': 15,
  'View settings.toml': 16,
  'Show the current Mostro configuration file (Nostr secret redacted)': 17,
  'Current configuration on disk:': 18,
  'Read-only. Re-run this action after changing settings to refresh.': 19,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
