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
  docsUrl: 'https://mostro.network/protocol/',
  description: {
    short: 'NO-KYC peer-to-peer Lightning Network Bitcoin exchange platform',
    long: 'Mostro is a revolutionary peer-to-peer Bitcoin exchange platform built on top of the Lightning Network and Nostr protocol. It enables users to buy and sell Bitcoin without KYC requirements or compromising personal data. Operating as a decentralized escrow service, Mostro facilitates secure Bitcoin transactions while maintaining censorship resistance and eliminating single points of failure. The platform uses hold invoices for sellers and regular Lightning invoices for buyers, ensuring minimal custody time while reducing risk for both parties. Built on Nostr, Mostro creates a truly decentralized marketplace where multiple Mostro nodes compete for users through reputation-based systems, making it particularly valuable for users in authoritarian regimes or anyone seeking financial privacy and freedom.',
  },
  volumes: ['main'],
  images: {
    'mostro': {
      source: {
        dockerTag: 'arkanoider/mostro:14.0.0',
      },
      arch: ['x86_64'],
      emulateMissingAs: 'x86_64',
    },
  },
  hardwareRequirements: {
    arch: ['x86_64'],
    ram: 512,
    device: undefined,
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    lnd: {
      description: 'Lightning node',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.19.1-beta.1-alpha.5/lnd.s9pk'
    },
  },
})
