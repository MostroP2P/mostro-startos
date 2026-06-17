import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.17.5:0',
  releaseNotes: {
    en_US:
      'Mostro v0.17.5 adds optional anti-abuse bonds: traders may lock a small bond before certain trades; honest completion returns it, stalling or abandoning can forfeit part or all.',
    es_ES:
      'Mostro v0.17.5 añade bonos anti-abuso opcionales: los operadores pueden bloquear una pequeña fianza antes de ciertas operaciones; completar con normalidad la devuelve, abandonar o demorar puede perderla.',
    de_DE:
      'Mostro v0.17.5 führt optionale Anti-Missbrauchs-Kautionen ein: vor bestimmten Trades kann eine kleine Kaution hinterlegt werden; bei ordnungsgemäßem Abschluss wird sie zurückgegeben, bei Abbruch oder Verzögerung kann sie verfallen.',
    pl_PL:
      'Mostro v0.17.5 wprowadza opcjonalne kaucje anti-abuse: przed niektórymi transakcjami można zablokować niewielką kaucję; uczciwe zakończenie ją zwraca, porzucenie lub opóźnienie może ją utracić.',
    fr_FR:
      'Mostro v0.17.5 ajoute des cautions anti-abus optionnelles : avant certains trades, une petite caution peut être verrouillée ; un échange mené à bien la rend, l’abandon ou les retards peuvent l’entraîner.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
