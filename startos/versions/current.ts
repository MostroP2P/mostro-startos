import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.17.4:0',
  releaseNotes: {
    en_US: 'Bump upstream to Mostro v0.17.4.',
    es_ES: 'Actualización a Mostro v0.17.4.',
    de_DE: 'Update auf Mostro v0.17.4.',
    pl_PL: 'Aktualizacja do Mostro v0.17.4.',
    fr_FR: 'Mise à jour vers Mostro v0.17.4.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
