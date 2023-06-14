/* eslint-disable @typescript-eslint/no-explicit-any */
import * as atomic from 'atomicassets'
import { activeNetwork } from 'src/lib/config'
export const atomicRpc = new atomic.RpcApi(activeNetwork().nodeUrl, 'atomicassets', { rateLimit: 10 })
export const atomicApi = new atomic.ExplorerApi(activeNetwork().atomicMarketApi, 'atomicassets', {  })
