import { matches, FileHelper } from '@start9labs/start-sdk'

const { object, string, boolean } = matches

// Store only sensitive data (passwords, private keys, etc.)
// All other configuration is stored in settings.toml via daemon_settings
const shape = object({
  // Store only whether password protection is enabled
  // The actual password is NEVER stored for security reasons
  db_password_required: boolean,
  // Store the actual database password (will be encrypted by StartOS)
  db_password: string,
  // Track whether Nostr keys have been configured
  nostrKeysConfigured: boolean,
})

export const storeJson = FileHelper.json(
  {
    volumeId: 'main',
    subpath: '/store.json',
  },
  shape,
)
