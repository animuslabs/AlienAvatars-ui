/* eslint-disable @typescript-eslint/no-explicit-any */
import { Name, NameType } from 'anchor-link'
import { activeNetwork } from 'src/lib/config'
import { EventEmitter } from 'eventemitter3'
import { link } from 'src/lib/linkManager'
interface GetTableParams {
  tableName: NameType
  scope?: NameType
  contract?: NameType
}
export async function getFullTable<T>(params: GetTableParams, type?:any):Promise<T[]> {
  const code = params.contract || activeNetwork().contracts.avatarmk
  const table = params.tableName
  let { scope } = params
  if (!scope) scope = code
  let lower_bound: any = null
  // console.log(code)

  const rows:T[] = []
  async function loop() {
    // @ts-ignore
    const result = await link.rpc.get_table_rows({ code: Name.from(code), table, scope, limit: 100, lower_bound, type })
    result.rows.forEach(el => rows.push(el))
    if (result.more) lower_bound = result.next_key
    else return
    return loop()
  }
  await loop()
  return <T[]>rows
}
export function streamFullTable<T>(params: GetTableParams, type?:any) {
  const emitter = new EventEmitter()
  const code = params.contract || activeNetwork().contracts.avatarmk
  const table = params.tableName
  let { scope } = params
  if (!scope) scope = code
  let lower_bound: any = null
  async function loop() {
    // @ts-ignore
    const result = await link.rpc.get_table_rows({ code, table, scope, limit: 500, lower_bound, type, reverse: false })
    if (!result) return
    if (!result.rows) return
    emitter.emit('rows', result.rows as T[])
    if (result.more) lower_bound = result.next_key
    else return emitter.emit('finished')
    return loop()
  }
  loop()
  return emitter
}

// // let client: APIClient
// // let provider: APIProvider
// // export const rpcs: { endpoint: URL, rpc: typeof client.v1.chain }[] = env.endpoints.map(el => {
// //   provider = new FetchProvider(el.toString(), { fetch })
// //   client = new APIClient({ provider })
// //   return { endpoint: el, rpc: client.v1.chain }
// // })
// // const abiCache:Record<string,ABI.Def> = {}

// // interface TransactionResponse {
// //   url: string
// //   receipt: {
// //     id: string;
// //     block_num: number;
// //     block_time: string;
// //     receipt: {
// //       status: string;
// //       cpu_usage_us: number;
// //       net_usage_words: number;
// //     };
// //     elapsed: number;
// //     net_usage: number;
// //     scheduled: boolean;
// //     action_traces: any[];
// //     account_ram_delta: any;
// //   }
// // }
// // export interface DoActionResponse {
// //   receipts: TransactionResponse[]
// //   errors: any[]
// // }

// // async function errorCounter(endpoint: string, error: string) {
// //   console.log('error:', endpoint, error)
// // }

// export async function safeDo(cb: string, params?: any, retry?: number): Promise<any | null> {
//   if (!retry) retry = 0
//   const rpc = pickRpc()
//   const url = rpc.endpoint.toString()
//   console.log('Try rpc:', url)

//   try {
//     const doit = async () => {
//       try {
//         const result = (await rpc.rpc[cb](params))
//         return result
//       } catch (error) {
//         const errorMsg = error.toString() as string
//         console.error('safeDo Error:', rpc.endpoint.toString(), errorMsg, error)
//         if (cb === 'get_account' && (errorMsg.search('unknown key') > -1)) {
//           retry = 5
//           throw (error)
//         } else {
//           errorCounter(url, errorMsg)
//           await sleep(ms('8s'))
//           throw (error)
//         }
//       }
//     }
//     const result = await Promise.race([
//       doit(),
//       // doit(),
//       new Promise((res, reject) => setTimeout(() => reject(new Error('SafeDo Timeout:')), ms('3s'))),
//     ])
//     // console.log('Result:', result);

//     return result
//   } catch (error) {
//     console.error('DoRequest Error:', url)
//     retry++
//     console.error('RETRY', retry)
//     if (retry < 5) return safeDo(cb, params, retry)
//   }
// }

// // export async function getAllScopes(params: API.v1.GetTableByScopeParams) {
// //   let { code } = params
// //   if (!code) code = env.contractAccount
// //   const { table } = params
// //   let lower_bound: any = null
// //   const rows: any[] = []
// //   async function loop(): Promise<any> {
// //     const result = await safeDo('get_table_by_scope', { code, table, limit: -1, lower_bound })
// //     result.rows.forEach((el: any) => rows.push(el))
// //     console.log('scopes:', rows.length)

// //     if (result.more) lower_bound = result.more
// //     else return
// //     return loop()
// //   }
// //   await loop()
// //   return rows.map(el => el.scope) as Name[]
// // }

// // export function getInfo(): Promise<API.v1.GetInfoResponse> {
// //   return safeDo('get_info')
// // }

// // export async function getAccount(name: Name): Promise<API.v1.AccountObject> {
// //   const result = (await safeDo('get_account', name)) as API.v1.AccountObject
// //   return result
// // }

// // export async function doAction(name: NameType, data?: { [key: string]: any } | null, contract?: NameType, authorization?: PermissionLevel[], keys?: PrivateKey[], retry?: number): Promise<DoActionResponse | null> {
// //   if (!data) data = {}
// //   if (!contract) contract = Name.from(env.contractAccount)
// //   if (!authorization) authorization = [PermissionLevel.from({ actor: env.workerAccount, permission: env.workerPermission })]

// //   const info = await getInfo()
// //   const header = info.getTransactionHeader()
// //   let action:Action
// //   try {
// //     action = Action.from({
// //       authorization,
// //       account: contract,
// //       name, data,
// //     })
// //   } catch (error) {
// //     // console.log(error.toString())

// //     let abi = abiCache[contract.toString()]
// //     if(!abi){
// //       abi = (await pickRpc().rpc.get_abi(contract)).abi
// //       abiCache[contract.toString()] = abi
// //     }
// //     if (!abi) {
// //       throw new Error(`No ABI for ${contract}`)
// //     }
// //     action = Action.from({
// //       authorization,
// //       account: contract,
// //       name, data,
// //     },abi)
// //   }
// //   const transaction = Transaction.from({
// //     ...header,
// //     actions: [action], max_cpu_usage_ms: 8,
// //   })
// //   if (!keys) keys = [env.keys[0]]

// //   const signatures = keys.map(key => key.signDigest(transaction.signingDigest(info.chain_id)))
// //   const signedTransaction = SignedTransaction.from({ ...transaction, signatures })
// //   const receipts: TransactionResponse[] = []
// //   const errors: any[] = []
// //   let apis = shuffle(rpcs)
// //   if (apis.length > 4) apis = apis.splice(0, 4)
// //   // console.log(apis)

// //   const timeoutTimer = ms('10s')
// //   await Promise.all(apis.map(({ endpoint, rpc }) => Promise.race([
// //     new Promise(res => {
// //       rpc.push_transaction(signedTransaction).then(result => {
// //         receipts.push({ url: endpoint.origin, receipt: result.processed })
// //       }).catch(error => {
// //         // console.log('Error Type:', typeof error);
// //         errors.push({ url: endpoint.origin, error: error?.error?.details[0]?.message || JSON.stringify(error?.error, null, 2) })
// //       }).finally(() => res(null))
// //     }),
// //     new Promise(res => setTimeout(() => {
// //       errors.push({ url: endpoint.origin, error: 'Timeout Error after ' + (timeoutTimer / 1000) + ' seconds' })
// //       res(null)
// //     }, timeoutTimer)),
// //   ])))
// //   // console.log('doAction finished;', receipts, errors);
// //   interface UniqueErrors {
// //     endpoints: string[]
// //     error: string
// //   }
// //   const uniqueErrors: UniqueErrors[] = []
// //   errors.forEach(el => {
// //     const exists = uniqueErrors.findIndex(el2 => el2.error = el.error)
// //     if (exists === -1) {
// //       el.endpoints = [el.url]
// //       delete el.url
// //       uniqueErrors.push(el)
// //     } else {
// //       uniqueErrors[exists].endpoints.push(el.url)
// //     }
// //   })

// //   return { receipts, errors: uniqueErrors }
// // }

// export function pickRpc(): typeof rpcs[0] {
//   const pick = rpcs[rand(0, rpcs.length - 1)]
//   // console.log('pickRPC:', pick.endpoint.toString())
//   return pick
// }

// // export function pickEndpoint(): string {
// //   const pick = rpcs[rand(0, rpcs.length - 1)]
// //   // console.log('pickRPC:', pick.endpoint.toString())
// //   return pick.endpoint.toString()
// // }
