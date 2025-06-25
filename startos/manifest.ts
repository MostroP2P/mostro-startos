import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'hello-moon',
  title: 'Hello Moon',
  license: 'mit',
  wrapperRepo: 'https://github.com/MostroP2P/mostro-startos',
  upstreamRepo: 'https://github.com/MostroP2P/mostro',
  supportSite: 'https://t.me/MostroP2P',
  marketingSite: 'https://mostro.network/',
  donationUrl: 'https://geyser.fund/project/mostro',
  description: {
    short: 'Bare bones example of a StartOS service with dependencies',
    long: 'Hello Moon is a bare-bones service with dependencies that launches a web interface to say "Hello Moon", and nothing more.',
  },
  volumes: ['main'],
  images: {
    'hello-moon': {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
        },
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissingAs: 'aarch64',
    },
  },
  hardwareRequirements: {},
  alerts: {
    install:
    'READ CAREFULLY! LND and the Lightning Network are considered beta software. Please use with caution and do not risk more money than you are willing to lose. We encourage frequent backups, particularly after opening or closing channels. If for any reason, you need to restore LND from a backup, your on-chain wallet will be restored. Any channels in the backup will be closed and their funds returned to your on-chain wallet, minus fees. It may also take some time for this process to occur. Any channels opened after the last backup CANNOT be recovered by backup restore.',
  update: null,
  uninstall:
    'READ CAREFULLY! Uninstalling LND will result in permanent loss of data, including its private keys for its on-chain wallet and all channel states. Please make a backup if you have any funds in your on-chain wallet or in any channels. Recovering from backup will restore your on-chain wallet, but due to the architecture of the Lightning Network, your channels cannot be recovered. All channels included in the backup will be closed and their funds returned to your on-chain wallet, minus fees. Any channels opened after the last backup CANNOT be recovered by backup restore',
  restore:
    'READ CAREFULLY! Any channels opened since the last backup will be forgotten and may linger indefinitely, and channels contained in the backup will be closed and their funds returned to your on-chain wallet, minus fees. After all recoverable funds are available in your on-chain wallet, all funds should be swept to a different wallet. NEVER use a restored LND wallet to open new channels. If you would like to use LND after a backup restore you will first need to sweep all on-chain funds to a different wallet, next LND can be safely uninstalled, and finally LND can be installed fresh from the marketplace.',
  start: null,
  stop: null,
  },
  dependencies: {
    bitcoind: {
      description: 'Bitcoin node',
      optional: false,
      s9pk: 'https://github.com/Start9Labs/bitcoind-startos/releases/download/v26.0.0-beta.1-alpha.0/bitcoind.s9pk',
    },
    lnd: {
      description: 'Lightning node',
      optional: false,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.19.1-beta.1-alpha.0/lnd.s9pk',
    },
  },
})
