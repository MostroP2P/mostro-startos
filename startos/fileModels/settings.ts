import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const natural = (defaultVal: number) =>
  z.number().int().nonnegative().catch(defaultVal)

const lightningSchema = z.object({
  lnd_cert_file: z.string().catch('/lnd/tls.cert'),
  lnd_macaroon_file: z
    .string()
    .catch('/lnd/data/chain/bitcoin/mainnet/admin.macaroon'),
  lnd_grpc_host: z.string().catch('https://lnd.startos:10009'),
  invoice_expiration_window: natural(3600),
  hold_invoice_cltv_delta: natural(144),
  hold_invoice_expiration_window: natural(300),
  payment_attempts: natural(3),
  payment_retries_interval: natural(60),
})

const nostrSchema = z.object({
  nsec_privkey: z.string().catch(''),
  relays: z.array(z.string()).catch(['wss://relay.mostro.network']),
})

const mostroSchema = z.object({
  fee: z.number().catch(0),
  max_routing_fee: z.number().catch(0.001),
  max_order_amount: natural(1_000_000),
  min_payment_amount: natural(100),
  expiration_hours: natural(24),
  max_expiration_days: natural(15),
  expiration_seconds: natural(900),
  user_rates_sent_interval_seconds: natural(3600),
  publish_relays_interval: natural(60),
  pow: natural(0),
  publish_mostro_info_interval: natural(300),
  bitcoin_price_api_url: z.string().catch('https://api.yadio.io'),
  fiat_currencies_accepted: z
    .array(z.string())
    .catch(['USD', 'EUR', 'ARS', 'CUP']),
  max_orders_per_response: natural(10),
  dev_fee_percentage: z.number().catch(0.3),
})

const databaseSchema = z.object({
  url: z.string().catch('sqlite://mostro/mostro.db'),
})

const rpcSchema = z.object({
  enabled: z.boolean().catch(false),
  listen_address: z.string().catch('127.0.0.1'),
  port: natural(50051),
})

const expirationSchema = z.object({
  order_days: natural(30),
  rating_days: natural(90),
  dispute_days: natural(90),
  fee_audit_days: natural(365),
})

const shape = z.object({
  lightning: lightningSchema.catch(() => lightningSchema.parse({})),
  nostr: nostrSchema.catch(() => nostrSchema.parse({})),
  mostro: mostroSchema.catch(() => mostroSchema.parse({})),
  database: databaseSchema.catch(() => databaseSchema.parse({})),
  rpc: rpcSchema.catch(() => rpcSchema.parse({})),
  expiration: expirationSchema.catch(() => expirationSchema.parse({})),
})

export const daemon_settings = FileHelper.toml(
  { base: sdk.volumes.main, subpath: './settings.toml' },
  shape,
)
