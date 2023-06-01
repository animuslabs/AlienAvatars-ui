import { defineStore } from 'pinia'
import { link } from 'src/lib/linkManager' // to access rpc for active chain
import { getFullTable, streamFullTable } from 'src/lib/eosio'
import { Name, UInt64 } from 'anchor-link'
import { markRaw, nextTick, reactive, readonly, Ref, ref, shallowReactive } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { useUser } from 'src/stores/UserStore'
import { deepClone, getCollection, sleep, throwError } from 'src/lib/utils'
import { deserialize, ObjectSchema } from 'atomicassets'

import { Elements, elementsList } from 'src/types/avatarParts'
import ms from 'ms'
import { atomicApi } from 'src/lib/atomic'
import { makeElementsObj } from 'src/stores/DesignerStore'
import { RemovableRef, useLocalStorage } from '@vueuse/core'
export type AccountAssetsType = Record<number, string[]>

export interface PackMeta { name: string, edition: string, size: number, img:string }
export class PackMetaClass {
  name = ' '
  edition = ''
  size = 0
  img = ''
}

const myPack: PackMetaClass = new PackMetaClass()

const myPack2: PackMetaClass = {
  edition: 'testdata',
  img: 'testdata',
  name: 'testdata',
  size: 0
}
const imgQueue:string[] = []

// setInterval(() => {
//   if (imgQueue.length > 0) new Image().src = 'https://ipfs.animus.is/ipfs/' + imgQueue.pop()
// }, 5000)

async function cacheImg(ipfsString) {
  imgQueue.push(ipfsString)
}

// export interface PartCardMeta {
//   name:string, rarityScore:number, rarity:string, bodypart:Elements, info:string, url:string, img:string
// }
export class PartCardMeta {
  name = ''
  rarityScore = 0
  rarity = ''
  edition = ''
  bodypart:Elements = 'head'
  info = ''
  url = ''
  img = ''
  img2 = ''
  offset = ''
}
export interface TemplateStats {
  issued:number
  burned:number
}

export type AvatarMeta = {
  name: string,
  edition: string,
  rarity: string,
  rarityScore: number,
  mint: number,
  head: string,
  top: string,
  torso: string,
  legs: string,
  equipment: string,
  background: string,
  avatarparts: number[]
  img:string
}
export type TemplateData = {
  schemaName:string
  immutableData:PackMeta|PartCardMeta |AvatarMeta
  maxSupply?:number
}
export interface AssetRow {
  asset_id:string,
  collection_name:string,
  schema_name:string,
  template_id:string
}
export interface AssetData {
  assetId:string
  templateId:number
}
export interface SchemaData {
  name:string,
  type:string
}
interface TemplateRow {
  template_id:string,
  schema_name:string,
  transferable:boolean,
  burnable:boolean,
  max_supply:number,
  issued_supply:string,
  immutable_serialized_data:Uint8Array
}
interface SchemaRow {
  schema_name:string,
  format:SchemaData[]
}
type GetTemplateReturn<T extends true | false> = T extends true ? TemplateData : TemplateData | undefined;

export type PartsMeta = {templateId:string, meta:PartCardMeta}
type PartsByType = Record<Elements, PartsMeta[]>

export function defaultPartsByType(): Record<Elements, []> {
  return makeElementsObj<[]>([])
}

function isTemplateData(value: unknown): value is TemplateData {
  return value !== undefined
}

const emptyPartsByType:PartsByType = Object.freeze(defaultPartsByType())
export interface AtomicData {
  templateData: Record<number, TemplateData>
  accountAssets:AccountAssetsType
  schemas:RemovableRef<{[key:string]:SchemaData[]}>
  templateIssued:{[key:number]:number}
  templateStats:Record<number, TemplateStats|null>
  initialized:boolean
  accountAssetsLoaded:string|null
}
export const atomicState = defineStore({
  id: 'atomic',
  state: ():AtomicData => ({
    templateData: useLocalStorage('templateData', shallowReactive({})),
    accountAssets: {},
    schemas: useLocalStorage('schemas', shallowReactive({})),
    templateIssued: {},
    initialized: true,
    templateStats: useLocalStorage('templateStats', reactive({})),
    accountAssetsLoaded: null
  }),
  getters: {
    partsByType():PartsByType {
      const returnData = deepClone(emptyPartsByType)
      for (const [templateId, templateData] of Object.entries(this.templateData)) {
        if (!templateData) continue
        const data = templateData.immutableData

        if (!('bodypart' in data)) continue
        // console.log(data.bodypart)
        returnData[data.bodypart].push({ meta: data, templateId })
      }
      return returnData
    }
  },
  actions: {

    /**
     * Gets template data from the store, must be loaded previously (default) throws if missing
     */

    getTemplate<T extends true | false = true>(templateId: number, throwIfMissing?: T): GetTemplateReturn<T> {
      const part = atomicState().templateData[templateId]
      if (!part && throwIfMissing) {
        throw new Error("Can't find template: " + templateId)
      } else {
        if (isTemplateData(part)) {
          return part as GetTemplateReturn<T>
        } else throw new Error('Unexpected error occurred.')
      }
      return undefined as GetTemplateReturn<T>
    },
    async getSchema(schemaName:string, force = false) {
      if (!force) if (this.schemas[schemaName]) return
      const collection = getCollection()
      const search = Name.from(schemaName)
      const schema = await link.rpc.get_table_rows({ scope: collection, code: 'atomicassets', table: 'schemas', json: true, limit: 1, lower_bound: search, upper_bound: search })
      if (!schema.rows[0]) return console.error('error finding schema', schemaName)
      const row:SchemaRow = schema.rows[0]
      this.schemas[schemaName] = markRaw(row.format)
    },
    async loadTemplate(templateId:number, force = false) {
      if (!force) if (this.templateData[templateId]) return
      const collection = contractState().currentConfig.collection_name
      if (!collection) throw (new Error('load contract config first'))
      console.log('loadTemplate called for:', templateId, this.templateData[templateId])
      // return
      const search = UInt64.from(templateId)
      const template = await link.rpc.get_table_rows({ scope: collection, code: 'atomicassets', table: 'templates', json: true, lower_bound: search })
      if (!template.rows[0]) return console.error('error finding template', templateId)
      this.saveTemplateData(template.rows[0])
    },
    async getTemplateIssued(templateId:number) {
      const collection = getCollection()
      if (!collection) throw (new Error('load contract config first'))
      // console.log(templateId)
      const search = UInt64.from(templateId)
      const template = await link.rpc.get_table_rows({ scope: collection, code: 'atomicassets', table: 'templates', json: true, lower_bound: search })
      const row:TemplateRow = template.rows[0]
      this.templateIssued[templateId] = parseInt(row.issued_supply)
    },
    async getManyTemplateStats(templateIds:number[]) {
      const collection = getCollection()
      if (!collection) throw (new Error('load contract config first'))
      for (const templateId of templateIds) {
        await sleep(100)
        try {
          const result = await atomicApi.getTemplateStats(collection, templateId.toString())
          this.templateStats[templateId] = readonly(reactive({ burned: parseInt(result.burned), issued: parseInt(result.assets) }))
        } catch (error) {
          console.error(error)
          await sleep(ms('9500ms'))
        }
      }
    },
    async getAccountAssets(accountName?:string):Promise<void> {
      return new Promise((resolve, reject) => {
        console.log('get account assets')
        try {
          const collectionName = contractState().config?.collection_name?.toString()
          if (!collectionName) return
          if (!accountName) {
            const loggedInUser = useUser().loggedIn.account
            if (!loggedInUser) return
            accountName = loggedInUser
          }
          this.accountAssetsLoaded = accountName
          // this.clearAccountAssets()
          const emitter = streamFullTable({ tableName: 'assets', contract: 'atomicassets', scope: accountName })
          const newAssets:AssetRow[] = []
          emitter.on('rows', (rows:AssetRow[]) => {
            rows.forEach(async row => {
              if (parseInt(row.template_id) < 1) return
              if (row.collection_name !== collectionName) return
              const templateId = parseInt(row.template_id)
              await this.loadTemplate(templateId)
              newAssets.push(row)
              const templateExists = this.accountAssets[templateId]
              if (templateExists && templateExists.some(el => el === row.asset_id)) return
              // @ts-ignore
              if (templateExists) this.accountAssets[templateId].push(row.asset_id)
              else this.accountAssets[templateId] = [row.asset_id]
            })
          })
          emitter.on('finished', () => {
            console.log('finished loading account assets')

            emitter.removeAllListeners()
            const templates = Object.keys(this.accountAssets)
            for (const template of templates) {
              // remove duplicates
              this.accountAssets[template] = reactive([...new Set(this.accountAssets[template])])
              if (!(this.accountAssets[template] instanceof Array)) continue
              const assets:string[] = this.accountAssets[template]
              // delete any assets from the store that were not found in this stream
              assets.forEach((el:string, i:number) => {
                const keep = newAssets.some((el2) => el2.asset_id === el)
                if (!keep) assets.splice(i, 1)
              })
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (this.accountAssets[template].length === 0) delete this.accountAssets[template]
            }
            resolve()
          })
        } catch (error) {
          console.error(error)
          reject()
          // setTimeout(() => this.getAccountAssets(accountName), 5000)
        }
      })
    },
    async clearAccountAssets() {
      this.accountAssets = reactive<AccountAssetsType>({})
    },
    async getAllParts() {
      return
      const config = contractState().currentConfig
      const collectionName = config.collection_name
      const partsSchema = config.parts_schema
      if (!collectionName || !partsSchema) return console.error('load config first')
      const partsSchemaString = partsSchema.toString()
      const emitter = streamFullTable({ tableName: 'templates', contract: 'atomicassets', scope: collectionName.toString() })
      emitter.on('rows', (rows:TemplateRow[]) => {
        console.log('templates:', rows)
        rows.forEach(async row => {
          const templateId = parseInt(row.template_id)
          if (row.schema_name === partsSchemaString) await this.loadTemplate(templateId)
        })
      })
      emitter.on('finished', () => {
        emitter.removeAllListeners()
      })
    },
    async getAllTemplates() {
      const collection = contractState().currentConfig.collection_name
      const rows = await getFullTable<TemplateRow>({ tableName: 'templates', contract: 'atomicassets', scope: collection })
      const schemas:string[] = [...new Set(rows.map(el => el.schema_name))]
      for (const schema of schemas) { await this.getSchema(schema) }
      for (const row of rows) { this.saveTemplateData(row) }
      console.log('finished injest template rows')
      this.initialized = true
    },
    async saveTemplateData(row:TemplateRow) {
      // console.log('saveTemplateData-' + row.template_id, row)
      const templateId = parseInt(row.template_id)
      if (this.templateData[templateId]) {
        // @ts-ignore
        const data = this.templateData[templateId].immutableData
        // if ('img' in data) cacheImg(data.img)
      }
      this.templateIssued[templateId] = parseInt(row.issued_supply)
      await this.getSchema(row.schema_name)
      if (!(row.schema_name in this.schemas)) return console.error('schema not found', row.schema_name)
      // @ts-ignore
      const schemaData: SchemaData[] = this.schemas[row.schema_name]
      const schema = ObjectSchema(schemaData)
      // console.time('deserialize-' + row.template_id)
      const immutableData: PackMeta | PartCardMeta | AvatarMeta = deserialize(row.immutable_serialized_data, schema)
      // console.timeEnd('deserialize-' + row.template_id)
      const maxSupply = row.max_supply
      let newData:TemplateData
      if (maxSupply !== 0) newData = markRaw<TemplateData>({ immutableData, schemaName: row.schema_name, maxSupply })
      else newData = markRaw<TemplateData>({ immutableData, schemaName: row.schema_name })
      // if ('img' in immutableData) cacheImg(immutableData.img)
      // console.log(newData)

      this.templateData[templateId] = newData
      // console.timeEnd('saveTemplateData-' + row.template_id)
    },
    rmAccountAsset(templateId:number, assetId:string) {
      if (!(this.accountAssets[templateId] instanceof Array)) return console.error('tried to remove from template the user doesnt own')
      // @ts-ignore
      this.accountAssets[templateId].splice(this.accountAssets[templateId].findIndex((el) => el === assetId), 1)
    }
  }
})
