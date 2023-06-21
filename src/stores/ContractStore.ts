/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { Avatars, Config, Deposits, Editions, Packs, Queue, Unpack } from 'src/types/avatarContractTypes'
import { link } from 'src/lib/linkManager' // to access rpc for active chain
import { getFullTable } from 'src/lib/eosio'
import { Asset, BytesType, Name, NameType, Serializer, UInt32, UInt64, UInt8 } from 'anchor-link'
import { globalState } from 'src/stores/GlobaleStore'
import { markRaw, reactive, readonly, shallowReactive } from 'vue'
import { useUser } from 'src/stores/UserStore'
import { activeNetwork } from 'src/lib/config'
import { deepClone } from 'src/lib/utils'

export type Edition = 'first'
const emptyTables: Record<Edition, any[]> = { first: [] }
class EmptyTables {
  first:any[] = []
}

export const defaultConfig = Config.from({
  freeze: false,
  moderator: '',
  auto_claim_packs: false,
  whitelist_enabled: false,
  payment_token: { sym: '4,TLM', contract: 'alien.worlds' },
  rng: '',
  collection_name: 'alienavatars',
  parts_schema: 'avatarparts',
  avatar_schema: 'avatars',
  pack_schema: 'avatarpacks',
  avatar_mint_pct_increase: 0.01
})

export interface ContractState {
  _avatars:Record<Edition, object[]>
  _queue: object[]
  _deposits:object[]
  _config:Record<string, any>|null
  _editions:Record<string, any>[]
  _packs:Record<Edition, object[]>
  _unpacks:object[]
}

export type EditionRow = {
  edition_scope: Name
  avatar_floor_mint_price: Asset
  avatar_template_price: Asset
  avatar_template_count: UInt64
  num_avatarparts: UInt8
  part_template_ids:number[][]
}

export const contractState = defineStore({
  id: 'contract',
  state: ():ContractState => ({
    _avatars: reactive(new EmptyTables()),
    _config: null,
    _queue: [],
    _deposits: [],
    _editions: [],
    _packs: reactive(new EmptyTables()),
    _unpacks: []
  }),
  getters: {
    currentConfig(): Config {
      return this.config || defaultConfig
    },
    allEditionTemplates(): number[] {
      if (!this.currentEditionRow) return []
      const allParts: number[] = ([] as number[]).concat(...this.currentEditionRow.part_template_ids)
      // console.log('allParts:', allParts)

      return allParts
    },
    currentEditionRow():EditionRow|undefined {
      return this.editions.find((el) => el.edition_scope.toString() === globalState().currentEdition)
    },
    packs: (state) => {
      const returnData:Record<Edition, Packs[]> = new EmptyTables()
      for (const packEdition of Object.keys(state._packs)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        returnData[packEdition] = state._packs[packEdition].map(el => Packs.from(el))
      }
      return returnData
    },
    avatars: (state) => {
      const returnData:Record<Edition, Avatars[]> = new EmptyTables()
      for (const avatarEdition of Object.keys(state._avatars)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        returnData[avatarEdition] = state._avatars[avatarEdition].map(el => Avatars.from(el))
      }
      return returnData
    },
    queue: (state) => state._queue.map(el => Queue.from(el)),
    deposits: (state) => state._deposits.map(el => Deposits.from(el)),
    editions: (state) => state._editions.map(el => ({
      edition_scope: Name.from(el.edition_scope),
      avatar_floor_mint_price: Asset.from(el.avatar_floor_mint_price),
      avatar_template_price: Asset.from(el.avatar_template_price),
      avatar_template_count: UInt64.from(el.avatar_template_count),
      num_avatarparts: UInt8.from(el.num_avatarparts),
      part_template_ids: el.part_template_ids
    })),
    config: (state) => state._config ? Config.from(state._config) : null,
    unpacks: (state) => state._unpacks.map(el => Unpack.from(el))
  },
  actions: {
    async getDeposits(account?:Name) {
      if (!account) account = Name.from(useUser().loggedIn.account as string)
      this._deposits = reactive(await getFullTable({ tableName: 'deposits', scope: account }))
    },
    async getAvatars(edition?:Edition) {
      if (!edition) edition = globalState().currentEdition
      this._avatars[edition] = reactive(await getFullTable({ tableName: 'avatars', scope: edition }))
    },
    async getPacks(edition?:Edition) {
      if (!edition) edition = globalState().currentEdition
      this._packs[edition] = shallowReactive(await getFullTable({ tableName: 'packs', scope: edition }))
    },
    async getConfig() {
      const result = (await getFullTable({ tableName: 'config2' }))[0]
      if (result) this._config = result as Record<string, any>
    },
    async getEditions() {
      this._editions = await getFullTable({ tableName: 'editions' })
    },
    async getUnpacks() {
      console.log('get unpacks')

      const targetAccount = Name.from(useUser().loggedIn.account as string)
      const newData = (await link.rpc.get_table_rows({
        code: activeNetwork().contracts.avatarmk || '',
        table: 'unpack',
        index_position: 'secondary',
        limit: 100,
        lower_bound: targetAccount,
        upper_bound: targetAccount,
        type: Unpack
      })).rows
      this._unpacks = newData
    }
  }
})
