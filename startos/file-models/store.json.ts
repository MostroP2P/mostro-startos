import { matches, FileHelper } from '@start9labs/start-sdk'

const { object, string, literals } = matches

const shape = object({
    db_password: string,
    lightning: literals('lnd', 'cln', 'none').onMismatch('none'),
})

export const storeJson = FileHelper.json(
    {
        volumeId: 'main',
        subpath: '/store.json',
    },
    shape,
)