import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v0_14_3_0 = VersionInfo.of({
  version: '0.14.3:0',
  releaseNotes: {
    en_US:
      'Migrate to StartOS SDK 1.5, remove deprecated database password support.',
    es_ES:
      'Migración al SDK 1.5 de StartOS, eliminación del soporte de contraseña de base de datos.',
    de_DE:
      'Migration auf StartOS SDK 1.5, Entfernung der veralteten Datenbankpasswort-Unterstützung.',
    pl_PL:
      'Migracja do StartOS SDK 1.5, usunięcie obsługi hasła bazy danych.',
    fr_FR:
      'Migration vers StartOS SDK 1.5, suppression du mot de passe de base de données.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
