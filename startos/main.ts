import { sdk } from './sdk'
import { manifest as mostroManifest } from './manifest'
import { storeJson } from './file-models/store.json'
import { lndMountpoint, clnMountpoint } from './utils'
import { daemon_settings } from './file-models/settings'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info('Starting Mostro daemon!')

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  // ========================
  // Main mount setup
  // ========================

  let mainMount = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mostro',
      readonly: false,
    })

  // ========================
  // Dependency setup & checks
  // ========================

      // @TODO mainMounts.mountDependency<typeof LndManifest>
      mainMount = mainMount.mountDependency({
        dependencyId: 'lnd',
        volumeId: 'main', //@TODO verify
        subpath: null,
        mountpoint: lndMountpoint,
        readonly: true,
      })

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
      mainMount,
      'mostro-sub',
    ),
    exec: { command: ['mostrod'] },
    ready: { display: null, fn: () => ({ result: 'success', message: null }) },
    requires: [],
  })
})
