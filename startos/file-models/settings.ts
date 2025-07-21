import { FileHelper, matches } from '@start9labs/start-sdk'

const { object, string, boolean, natural, number, array } = matches

// Shape definition for daemon settings based on TOML structure
// Note: Only db_password is stored in storeJson as sensitive data
const daemonSettingsShape = object({
  // Lightning configuration
  lightning: object({
    lnd_cert_file: string,
    lnd_macaroon_file: string,
    lnd_grpc_host: string,
    invoice_expiration_window: natural,
    hold_invoice_cltv_delta: natural,
    hold_invoice_expiration_window: natural,
    payment_attempts: natural,
    payment_retries_interval: natural,
  }),

  // Nostr configuration (now includes private key)
  nostr: object({
    nsec_privkey: string,
    relays: array(string),
  }),

  // Mostro configuration
  mostro: object({
    fee: number,
    max_routing_fee: number,
    max_order_amount: natural,
    min_payment_amount: natural,
    expiration_hours: natural,
    max_expiration_days: natural,
    expiration_seconds: natural,
    user_rates_sent_interval_seconds: natural,
    publish_relays_interval: natural,
    pow: natural,
    publish_mostro_info_interval: natural,
    bitcoin_price_api_url: string,
  }),

  // Database configuration
  database: object({
    url: string,
  }),

  // RPC configuration
  rpc: object({
    enabled: boolean,
    listen_address: string,
    port: natural,
  }),
})

// Export the daemon settings configuration
export const daemon_settings = FileHelper.toml(
  {
    volumeId: 'main',
    subpath: '/settings.toml',
  },
  daemonSettingsShape,
) 