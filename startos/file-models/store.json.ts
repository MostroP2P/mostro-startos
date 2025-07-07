import { matches, FileHelper } from '@start9labs/start-sdk'

const { object, string } = matches

// Store only sensitive data (passwords, private keys, etc.)
// All other configuration is stored in settings.toml via daemon_settings
const shape = object({
    // Sensitive data that should not be in plain TOML files
    nsec_privkey: string,  // Nostr private key
    db_password: string,   // Database password (if needed)
})

export const storeJson = FileHelper.json(
    {
        volumeId: 'main',
        subpath: '/store.json',
    },
    shape,
)