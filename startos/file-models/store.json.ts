import { matches, FileHelper } from '@start9labs/start-sdk'

const { object, string, literals, natural, number, boolean, array } = matches

const shape = object({
    db_password: string,
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
    nostr: object({
        nsec_privkey: string,
        relays: array(string),
    }),
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
    database: object({
        url: string,
    }),
    rpc: object({
        enabled: boolean,
        listen_address: string,
        port: natural,
    }),
})

export const storeJson = FileHelper.json(
    {
        volumeId: 'main',
        subpath: '/store.json',
    },
    shape,
)