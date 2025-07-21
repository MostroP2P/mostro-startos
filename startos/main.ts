import { sdk } from './sdk'
import { manifest as mostroManifest } from './manifest'
import { storeJson } from './file-models/store.json'
import { lndMountpoint, clnMountpoint } from './utils'
import { daemon_settings } from './file-models/settings'

export const main = sdk.setupMain(async ({ effects, started }: { effects: any; started: any }) => {
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
      mountpoint: '/mostro',  // ← Change to match Dockerfile
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
    mountpoint: '/lnd',
    readonly: true,
  })

  // ========================
  // SubContainer setup
  // ========================

  const mostroSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mostro' },
    mainMount,
    'mostro-sub',
  )

  /**
   * ======================== Daemons ========================
   *
   * In this section, we create one or more daemons that define the service runtime.
   *
   * Each daemon defines its own health check, which can optionally be exposed to the user.
   */
  return sdk.Daemons.of(effects, started).addDaemon('primary', {
    subcontainer: mostroSub,
    exec: {
      command: ['mostrod', '-d', '/mostro', '-c', 'true']
    },
    ready: { display: null, fn: () => ({ result: 'success', message: null }) },
    requires: [],
  })
  // .addHealthCheck('rpc version check', {
  //   ready: {
  //     display: "RPC Version Check",
  //     fn: async (): Promise<{ result: 'success' | 'failure'; message: string | null }> => {
  //       try {
  //         // Execute grpcurl command to call Admin/GetMostroVersion
  //         const result = await mostroSub.exec([
  //           'grpcurl',
  //           '-plaintext',
  //           'localhost:50051',
  //           'Admin/GetMostroVersion'
  //         ])

  //         // Check if the command was successful
  //         if (result.exitCode !== 0) {
  //           return {
  //             result: 'failure',
  //             message: `gRPC call failed: ${result.stderr || 'Unknown error'}`
  //           }
  //         }

  //         // Parse the response to check for version 14.0.0
  //         const output = result.stdout || ''
  //         if (output.includes('14.0.0')) {
  //           return {
  //             result: 'success',
  //             message: 'Mostro RPC is responding with correct version 14.0.0'
  //           }
  //         } else {
  //           return {
  //             result: 'failure',
  //             message: `Unexpected version response: ${output}`
  //           }
  //         }
  //       } catch (error) {
  //         return {
  //           result: 'failure',
  //           message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
  //         }
  //       }
  //     },
  //   },
  //   requires: ['primary'],
  // })
})
