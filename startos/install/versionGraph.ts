// Add type-only imports or ts-ignore for missing module types
// @ts-ignore
import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
// @ts-ignore
import { access } from 'fs/promises'
import { storeJson } from '../file-models/store.json'
import { daemon_settings } from '../file-models/settings'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects: any) => {
    // Check for existing store.json (sensitive data)
    try {
      await access('/media/startos/volumes/main/store.json')
      console.log('Found existing store.json')
    } catch {
      console.log("Couldn't find existing store.json. Creating with defaults")
      await storeJson.write(effects, {
        db_password: '',
      })
    }

    // Check for existing config.toml (non-sensitive data)
    try {
      await access('/media/startos/volumes/main/config.toml')
      console.log('Found existing config.toml')
    } catch {
      console.log("Couldn't find existing config.toml. Creating with defaults")
      await daemon_settings.write(effects, {
        lightning: {
          lnd_cert_file: '/lnd/tls.cert',
          lnd_macaroon_file: '/lnd/data/chain/bitcoin/mainnet/admin.macaroon',
          lnd_grpc_host: 'https://lnd.startos:10009',
          invoice_expiration_window: 3600,
          hold_invoice_cltv_delta: 144,
          hold_invoice_expiration_window: 300,
          payment_attempts: 3,
          payment_retries_interval: 60,
        },
        nostr: {
          nsec_privkey: 'nsec1...',
          relays: ['ws://localhost:7000'],
        },
        mostro: {
          fee: 0,
          max_routing_fee: 0.001,
          max_order_amount: 1000000,
          min_payment_amount: 100,
          expiration_hours: 24,
          max_expiration_days: 15,
          expiration_seconds: 900,
          user_rates_sent_interval_seconds: 3600,
          publish_relays_interval: 60,
          pow: 0,
          publish_mostro_info_interval: 300,
          bitcoin_price_api_url: 'https://api.yadio.io',
        },
        database: {
          url: 'sqlite://mostro/mostro.db',
        },
        rpc: {
          enabled: false,
          listen_address: '127.0.0.1',
          port: 50051,
        },
      })
    }
  },
})
