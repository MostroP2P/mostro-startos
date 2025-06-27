import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'mostro',
  title: 'Mostro',
  license: 'mit',
  wrapperRepo: 'https://github.com/MostroP2P/mostro-startos',
  upstreamRepo: 'https://github.com/MostroP2P/mostro',
  supportSite: 'https://t.me/MostroP2P',
  marketingSite: 'https://mostro.network/',
  donationUrl: 'https://geyser.fund/project/mostro',
  description: {
    short: 'NO-KYC peer-to-peer Lightning Network Bitcoin exchange platform',
    long: 'Mostro is a revolutionary peer-to-peer Bitcoin exchange platform built on top of the Lightning Network and Nostr protocol. It enables users to buy and sell Bitcoin without KYC requirements or compromising personal data. Operating as a decentralized escrow service, Mostro facilitates secure Bitcoin transactions while maintaining censorship resistance and eliminating single points of failure. The platform uses hold invoices for sellers and regular Lightning invoices for buyers, ensuring minimal custody time while reducing risk for both parties. Built on Nostr, Mostro creates a truly decentralized marketplace where multiple Mostro nodes compete for users through reputation-based systems, making it particularly valuable for users in authoritarian regimes or anyone seeking financial privacy and freedom.',
  },
  volumes: ['main'],
  images: {
    'mostro': {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
        },
      },
    },
  },
  hardwareRequirements: {},
  alerts: {
    install:null,
    update: null,
    uninstall:null,
    restore:null,
    start: null,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description: 'Bitcoin node',
      optional: false,
      s9pk: 'https://github.com/Start9Labs/bitcoind-startos/releases/download/v28.1.0.2/bitcoind.s9pk',
    },
    lnd: {
      description: 'Lightning node',
      optional: false,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.19.1-beta.1-alpha.0/lnd.s9pk',
    },
  },
})
