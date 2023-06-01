/* eslint-disable @typescript-eslint/no-explicit-any */
import * as atomic from 'atomicassets'
import { activeNetwork } from 'src/lib/config'
import fetch from 'unfetch'
export const atomicRpc = new atomic.RpcApi(activeNetwork().nodeUrl, 'atomicassets', { rateLimit: 10, fetch: fetch as any })
export const atomicApi = new atomic.ExplorerApi(activeNetwork().atomicMarketApi, 'atomicassets', { fetch: fetch as any })
