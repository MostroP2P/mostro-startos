import { sdk } from './sdk'
import { manifest as mostroManifest } from './manifest'
import { storeJson } from './file-models/store.json'
import { lndMountpoint, clnMountpoint } from './utils'
import { daemon_settings } from './file-models/settings'
import { current as mostroVersionInfo } from './install/versions'
import { rpcSettings } from './actions/rpcSettings'

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
  // Read database configuration from storeJson
  // ========================
  const store = await storeJson.read((s: any) => s).const(effects)
  const dbPasswordRequired = !!store?.db_password_required
  const dbPassword = store?.db_password || ''

  // Note: Password is stored securely by StartOS
  // If password is required, it will be provided to the service

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
  // Build the command array based on whether password is required
  let mostroCommand: [string, ...string[]] = ['mostrod', '-d', '/mostro', '-c']

  if (dbPasswordRequired && dbPassword) {
    // Add password parameter when password is required and available
    mostroCommand = ['mostrod', '-d', '/mostro', '-c', '-p', dbPassword]
    console.log('Database password protection enabled. Starting with password.')
  } else if (dbPasswordRequired && !dbPassword) {
    console.warn('Database password is required but no password is stored.')
    console.warn('Service may fail to start until password is provided.')
  } else {
    console.log('Database password protection disabled. Starting without password.')
  }

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
    .addHealthCheck('rpc-version-check', {
      ready: {
        display: "RPC Version Check",
        fn: async (): Promise<{ result: 'success' | 'failure' | 'disabled'; message: string | null }> => {
          try {
            // Get the current RPC settings from TOML config
            const tomlConfig = await daemon_settings.read((s) => s).const(effects)
            const rpcConfig = tomlConfig?.rpc || { enabled: false }

            if (!rpcConfig.enabled) {
              return {
                result: 'disabled',
                message: 'RPC server is disabled'
              }
            }

            // Execute grpcurl command to call Admin/GetMostroVersion
            // Use the proto file that should be copied to /proto in the Docker image
            let result = await mostroSub.exec([
              'grpcurl',
              '-plaintext',
              '-import-path',
              '/proto',
              '-proto',
              'admin.proto',
              '-d',
              '{}',
              '127.0.0.1:50051',
              'mostro.admin.v1.AdminService/GetVersion'
            ])

            // If that fails, try with absolute path and import path
            if (result.exitCode !== 0) {
              console.log('Trying with absolute proto path and import path...')
              result = await mostroSub.exec([
                'grpcurl',
                '-plaintext',
                '-import-path',
                '/proto',
                '-proto',
                '/proto/admin.proto',
                '-d',
                '{}',
                '127.0.0.1:50051',
                '/mostro/mostro.admin.v1.AdminService/GetVersion'
              ])
            }

            // Check if the command was successful
            if (result.exitCode !== 0) {
              console.log(`gRPC call failed with exit code ${result.exitCode}`)
              console.log(`stderr: ${result.stderr}`)
              console.log(`stdout: ${result.stdout}`)
              return {
                result: 'failure',
                message: `gRPC call failed: ${result.stderr || 'Unknown error'}`
              }
            }

            // Parse the response to check for version
            const output = result.stdout || ''
            // Extract the version part before ':' if present
            const expectedVersion = '0.14.1' // Hardcoded version from VersionInfo
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
          } catch (error: unknown) {
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
