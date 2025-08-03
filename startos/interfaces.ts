import { sdk } from './sdk'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // RPC
  const rpcMulti = sdk.MultiHost.of(effects, 'rpc')
  const rpcMultiOrigin = await rpcMulti.bindPort(50051, {
    protocol: 'http',
    preferredExternalPort: 50051,
  })
  const rpc = sdk.createInterface(effects, {
    name: 'RPC Interface',
    id: 'rpc',
    description: 'Listens for JSON-RPC commands',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const rpcReceipt = await rpcMultiOrigin.export([rpc])

  const receipts = [rpcReceipt]

  return receipts
})
