import { i18n } from './i18n'
import { sdk } from './sdk'
import { manifest } from './manifest'
import { daemon_settings } from './fileModels/settings'

const dockerTag = manifest.images.mostro.source.dockerTag.split(':').pop() ?? 'v0.17.4'
const expectedVersion = dockerTag.replace(/^v/, '')

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Mostro!'))

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  let mainMount = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/mostro',
    readonly: false,
  })

  mainMount = mainMount.mountDependency({
    dependencyId: 'lnd',
    volumeId: 'main',
    subpath: null,
    mountpoint: '/lnd',
    readonly: true,
  })

  const mostroSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mostro' },
    mainMount,
    'mostro-sub',
  )

  const mostroCommand: [string, ...string[]] = [
    'mostrod',
    '-d',
    '/mostro',
    '-c',
  ]

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: mostroSub,
      exec: {
        command: mostroCommand,
      },
      ready: {
        display: null,
        fn: () => ({ result: 'success', message: null }),
      },
      requires: [],
    })
    .addHealthCheck('rpc-version-check', {
      ready: {
        display: i18n('RPC Version Check'),
        fn: async (): Promise<{
          result: 'success' | 'failure' | 'disabled'
          message: string | null
        }> => {
          try {
            const rpcEnabled = await daemon_settings
              .read((s) => s?.rpc?.enabled)
              .const(effects)

            if (!rpcEnabled) {
              return {
                result: 'disabled',
                message: 'RPC server is disabled',
              }
            }

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
              'mostro.admin.v1.AdminService/GetVersion',
            ])

            if (result.exitCode !== 0) {
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
                '/mostro/mostro.admin.v1.AdminService/GetVersion',
              ])
            }

            if (result.exitCode !== 0) {
              return {
                result: 'failure',
                message: `gRPC call failed: ${result.stderr || 'Unknown error'}`,
              }
            }

            const output = result.stdout || ''
            if (output.includes(expectedVersion)) {
              return {
                result: 'success',
                message: `Mostro RPC is responding with correct version ${expectedVersion}`,
              }
            }

            return {
              result: 'failure',
              message: `Unexpected version response: ${output}`,
            }
          } catch (error: unknown) {
            return {
              result: 'failure',
              message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
            }
          }
        },
      },
      requires: ['primary'],
    })
})
