import { sdk } from './sdk'
import { manifest as mostroManifest } from './manifest'
import { storeJson } from './file-models/store.json'
import { lndMountpoint, clnMountpoint } from './utils'
import { daemon_settings } from './file-models/settings'
import { current as mostroVersionInfo } from './install/versions'

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
  // Read db_password_required from storeJson
  // ========================
  const store = await storeJson.read((s: any) => s).const(effects)
  const dbPasswordRequired = !!store?.db_password_required
  let dbPassword = ''
  if (dbPasswordRequired) {
    // Prompt the user for the password at runtime (session-only)
    dbPassword = await sdk.Prompt.password({
      message: 'Enter Mostro database password:',
      required: true,
    })
  }

  // ========================
  // SubContainer setup
  // ========================

  const mostroSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mostro' },
    mainMount,
    'mostro-sub',
  )

  // ========================
  // Daemon command construction
  // ========================
  const mostroCommand = dbPasswordRequired && dbPassword
    ? ['mostrod', '-d', '/mostro', '-p', dbPassword]
    : ['mostrod', '-d', '/mostro', '-c']

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
      command: mostroCommand
    },
    ready: { display: null, fn: () => ({ result: 'success', message: null }) },
    requires: [],
  })
  .addHealthCheck('rpc version check', {
    ready: {
      display: "RPC Version Check",
      fn: async (): Promise<{ result: 'success' | 'failure'; message: string | null }> => {
        try {
          // Execute grpcurl command to call Admin/GetMostroVersion
          const result = await mostroSub.exec([
            'grpcurl',
            '-plaintext',
            'localhost:50051',
            'Admin/GetMostroVersion'
          ])

          // Check if the command was successful
          if (result.exitCode !== 0) {
            return {
              result: 'failure',
              message: `gRPC call failed: ${result.stderr || 'Unknown error'}`
            }
          }

          // Parse the response to check for version
          const output = result.stdout || ''
          // Extract the version part before ':' if present
          const expectedVersion = mostroVersionInfo.version
          if (output.includes(expectedVersion)) {
            return {
              result: 'success',
              message: `Mostro RPC is responding with correct version ${expectedVersion}`
            }
          } else {
            return {
              result: 'failure',
              message: `Unexpected version response: ${output}`
            }
          }
        } catch (error) {
          return {
            result: 'failure',
            message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
          }
        }
      },
    },
    requires: ['primary'],
  })
})
