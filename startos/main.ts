import { sdk } from './sdk'
import { manifest as mostroManifest } from 'mostro-startos/startos/manifest'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info('Starting Mostro daemon!')

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  /**
   * ======================== Daemons ========================
   *
   * In this section, we create one or more daemons that define the service runtime.
   *
   * Each daemon defines its own health check, which can optionally be exposed to the user.
   */
  return sdk.Daemons.of(effects, started).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'mostro' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'main',
          subpath: null,
          mountpoint: '.data',
          readonly: false,
        })
        .mountDependency<typeof mostroManifest>({
          dependencyId: 'mostro',
          volumeId: 'main',
          subpath: null,
          mountpoint: '/mostro',
          readonly: true,
        }),
      'mostro-sub',
    ),
    exec: { command: ['mostrod'] },
    ready: {
      display: 'Web Interface',
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: 'The web interface is ready',
          errorMessage: 'The web interface is unreachable',
        }),
    },
    requires: [],
  })
})
