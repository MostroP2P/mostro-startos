import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.17.5:0',
  releaseNotes: {
    en_US:
      'Bump upstream to Mostro v0.17.5 and add price, anti-abuse bond, and transport settings.',
    es_ES:
      'Actualización a Mostro v0.17.5 y nuevos ajustes de precio, anti-abuso y transporte.',
    de_DE:
      'Update auf Mostro v0.17.5 mit Preis-, Anti-Missbrauchs- und Transport-Einstellungen.',
    pl_PL:
      'Aktualizacja do Mostro v0.17.5 z ustawieniami cen, anti-abuse i transportu.',
    fr_FR:
      'Mise à jour vers Mostro v0.17.5 avec réglages prix, anti-abus et transport.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
