import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
    // Database configuration
    db_password: Value.text({
        name: 'Database Password',
        description: 'Optional database password for Mostro SQLite database. Leave empty for no password protection.',
        placeholder: 'Enter password (optional)',
        default: '',
        required: false,
        masked: true, // Hide password input
    }),
})

export const databaseSettings = sdk.Action.withInput(
    'database-settings',

    async ({ effects }) => ({
        name: 'Configure Database Settings',
        description: 'Configure database password protection for Mostro',
        warning: 'If you set a password, you will need to provide it every time the service restarts.',
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const currentSensitiveConfig = await storeJson.read((s: any) => s).const(effects)

        // Return the stored password for editing
        return {
            db_password: currentSensitiveConfig?.db_password || '',
        }
    },

    async ({ effects, input }) => {
        const dbPassword = input.db_password?.trim() || ''
        const passwordRequired = dbPassword.length > 0

        // Get current config to preserve other fields
        const currentConfig = await storeJson.read((s: any) => s).const(effects)

        // Update store.json with password requirement flag and actual password
        await storeJson.write(effects, {
            db_password_required: passwordRequired,
            db_password: dbPassword,
            nostrKeysConfigured: currentConfig?.nostrKeysConfigured || false,
        })

        // Update database URL in settings.toml
        const databaseConfig = {
            database: {
                url: 'sqlite://mostro/mostro.db',
            },
        }

        await daemon_settings.merge(effects, databaseConfig)

        // Log the configuration change
        if (passwordRequired) {
            console.log('Database password protection enabled. Password will be required at service restart.')
        } else {
            console.log('Database password protection disabled. Service will start without password.')
        }
    },
) 