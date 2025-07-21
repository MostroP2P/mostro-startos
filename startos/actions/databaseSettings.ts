import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
    // Database configuration
    database_url: Value.text({
        name: 'Database URL',
        description: 'Database connection URL',
        placeholder: 'sqlite://mostro.db',
        default: 'sqlite://mostro.db',
        required: true,
    }),
})

export const databaseSettings = sdk.Action.withInput(
    'database-settings',

    async ({ effects }) => ({
        name: 'Configure Database Settings',
        description: 'Configure database connection settings for Mostro',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }) => {
        const tomlConfig = await daemon_settings.read((s) => s).const(effects)

        const databaseConfig = tomlConfig?.database || {
            url: 'sqlite://mostro.db',
        }

        return {
            database_url: databaseConfig.url,
        }
    },

    async ({ effects, input }) => {
        const currentSensitiveConfig = await storeJson.read((s) => s).const(effects)

        // Prepare only the database section
        const databaseConfig = {
            database: {
                url: input.database_url,
            },
        }

        // Ensure sensitive config exists with only db_password
        if (!currentSensitiveConfig) {
            await storeJson.write(effects, {
                db_password: '',
            })
        }

        // Update only the database section
        await daemon_settings.merge(effects, databaseConfig)
    },
) 