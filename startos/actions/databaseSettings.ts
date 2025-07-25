import { storeJson } from '../file-models/store.json'
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

export const dbPasswordRequiredInputSpec = InputSpec.of({
    db_password_required: Value.boolean({
        name: 'Require Database Password',
        description: 'If enabled, you will be prompted for a password every time Mostro starts.',
        default: false,
        required: true,
    }),
})

export const dbPasswordRequiredSettings = sdk.Action.withInput(
    'db-password-required-settings',

    async ({ effects }: { effects: any }) => ({
        name: 'Require Database Password',
        description: 'Enable or disable password protection for the Mostro database. If enabled, you will be prompted for a password every time Mostro starts.',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    dbPasswordRequiredInputSpec,

    async ({ effects }: { effects: any }) => {
        const sensitiveConfig = await storeJson.read((s: any) => s).const(effects)
        return {
            db_password_required: !!sensitiveConfig?.db_password_required,
        }
    },

    async ({ effects, input }: { effects: any, input: any }) => {
        await storeJson.write(effects, {
            db_password_required: !!input.db_password_required,
        })
    },
)

export const databaseSettings = sdk.Action.withInput(
    'database-settings',

    async ({ effects }: { effects: any }) => ({
        name: 'Configure Database Settings',
        description: 'Configure database connection settings for Mostro',
        warning: null,
        allowedStatuses: 'any',
        group: 'Mostro',
        visibility: 'enabled',
    }),

    inputSpec,

    async ({ effects }: { effects: any }) => {
        const tomlConfig = await daemon_settings.read((s: any) => s).const(effects)

        const databaseConfig = tomlConfig?.database || {
            url: 'sqlite://mostro.db',
        }

        return {
            database_url: databaseConfig.url,
        }
    },

    async ({ effects, input }: { effects: any, input: any }) => {
        const currentSensitiveConfig = await storeJson.read((s: any) => s).const(effects)

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