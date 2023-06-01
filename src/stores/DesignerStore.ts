/* eslint-disable no-return-assign */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-duplicates */
import { defineStore } from 'pinia'
import { link } from 'src/lib/linkManager' // to access rpc for active chain
import { PartCardMeta, PartsMeta } from 'src/stores/AtomicStore'
import { AvatarPart, Elements, elementsList } from 'src/types/avatarParts'
import { reactive, readonly, ref } from 'vue'
import { atomicState } from 'src/stores/AtomicStore'
import allParts from 'src/statics/partsList.json'
import blankParts from 'src/statics/blankParts.json'
import { deepClone, getRarityName, partMetaToAvatarPart, throwError } from 'src/lib/utils'
import ipfs from 'src/lib/ipfs'
import { contractState } from 'src/stores/ContractStore'

import { RemovableRef, useLocalStorage } from '@vueuse/core'

export class SelectedMetaData {
  offset = new PartOffset()
  rawPath = ''
  templateId = 0
  rarityScore = 0
  rarity = ''
  name = ''
  cardIpfs = ''
  part = new AvatarPart()
}

export class BodyPartConfig {
  image: HTMLImageElement = new window.Image()
  x = 0
  y = 0
  width = 0
  height = 0
  draggable = false
  data: AvatarPart = new AvatarPart()
}

export class PartOffset {
  'x' = 0
  'y' = 0
  'width' = 0
  'height' = 0
}

export class BodyType {
  head: BodyPartConfig = new BodyPartConfig()
  top: BodyPartConfig = new BodyPartConfig()
  torso: BodyPartConfig = new BodyPartConfig()
  legs: BodyPartConfig = new BodyPartConfig()
  equipment: BodyPartConfig = new BodyPartConfig()
  background: BodyPartConfig = new BodyPartConfig()
}

export type FavoritesType = Record<string, Record<Elements, number>>

export function makeElementsObj<T>(defaultVal:T):Record<Elements, T> {
  const res = {}
  for (const el of elementsList) {
    res[el] = defaultVal
  }
  return res as Record<Elements, T>
}

export function defaultPartsSet() {
  return makeElementsObj<number>(0)
}

export function defaultPartsData() {
  return makeElementsObj<PartCardMeta>(new PartCardMeta())
}

export const defaultSelectedMeta = makeElementsObj<SelectedMetaData>(new SelectedMetaData())

export type FilterType = {sortByRarity:boolean, ownedOnly:boolean, showDetails:boolean, searchName:string|null}
export type DesignerStateType = {
  activeTab: Elements,
  atomicState: any,
  selectedParts:RemovableRef<Record<Elements, number>>,
  filter:FilterType,
  activeBookmark:string,
  favorites:FavoritesType,
  createTemplateMode:boolean
}
// export type SelectedMetaData = {
//   offset: PartOffset
//   rawPath:string
//   templateId:number
//   rarityScore: number
//   rarity:string
//   name:string
//   cardIpfs:string
//   part:AvatarPart
// }

export type SelectedMetaType = Record<Elements, SelectedMetaData>

// export async function getPartCardMeta(templateId: number): Promise<PartCardMeta | undefined> {
//   const state = atomicState()
//   const exists = state.getTemplate(templateId, false)
//   if (!exists) state.loadTemplate(templateId, true)
//   return state.getTemplate(templateId, false) as PartCardMeta | undefined
//   // return state.getTemplate(templateId, false)
// }
function blankTemplateData(type:any, part:any):PartCardMeta {
  const templateData:PartCardMeta = {
    bodypart: type,
    edition: 'first',
    img: part.ipfsCard || '',
    img2: part.ipfsRaw,
    info: '',
    name: 'blank',
    offset: JSON.stringify(part.offset),
    rarity: 'Legendary',
    rarityScore: 5,
    url: ''
  }
  return templateData
}

export const designerState = defineStore({
  id: 'DesignerState',
  state: ():DesignerStateType => ({
    activeTab: 'torso',
    atomicState: atomicState(),
    selectedParts: useLocalStorage('selectedParts', reactive(defaultPartsSet())),
    activeBookmark: 'custom',
    filter: {
      sortByRarity: false,
      ownedOnly: false,
      showDetails: true,
      searchName: null
    },
    favorites: reactive({}),
    createTemplateMode: false
  }),
  getters: {
    parts():AvatarPart[] {
      return allParts as AvatarPart[]
    },
    selectedMeta():SelectedMetaType {
      const data:SelectedMetaType = deepClone(defaultSelectedMeta)
      for (const [type, templateId] of Object.entries(this.selectedParts) as [Elements, number][]) {
        let templateData: PartCardMeta | undefined
        const part = blankParts.find(el => el.type === type)
        if (!part) throwError('error with blank part', type)
        if (templateId == 0) {
          templateData = blankTemplateData(type, part)
        } else templateData = this.atomicState.templateData[templateId]?.immutableData as PartCardMeta | undefined
        if (!templateData) {
          console.error('did not find template data:', type, templateId)
          this.atomicState.loadTemplate(templateId, true)
          continue
        }
        console.log(templateData)

        const partData: SelectedMetaData = {
          rarity: templateData.rarity,
          offset: JSON.parse(templateData.offset as any),
          rawPath: ipfs(templateData.img2),
          templateId,
          rarityScore: templateData.rarityScore || 1,
          name: templateData.name || 'alien',
          cardIpfs: templateData.img2 || blankParts[type].ipfsCard,
          part: partMetaToAvatarPart(templateData)
        }
        data[type] = partData
      }
      return data
    },
    rarityScore():number {
      const rarities = Object.values(this.selectedMeta).map(el => el.rarityScore)
      return Math.max(...rarities)
    },
    rarity(): string {
      return getRarityName(this.rarityScore)
    },
    visibleParts():PartsMeta[] {
      let parts:PartsMeta[] = deepClone(atomicState().partsByType[this.activeTab])
      // console.log(parts)

      if (this.filter.ownedOnly) {
        // @ts-expect-error TODO fix later
        parts = parts.filter(el => atomicState().accountAssets[parseInt(el.templateId)]?.length > 0)
      }
      if (this.filter.sortByRarity) {
        parts.sort((a, b) => (a.meta.rarityScore < b.meta.rarityScore ? 1 : -1))
      } else {
        parts.sort((a, b) => (a.meta.rarityScore > b.meta.rarityScore ? 1 : -1))
      }
      if (this.filter.searchName !== null) {
        const search = this.filter.searchName.toLowerCase()
        parts = parts.filter(el => el.meta.name.toLowerCase().includes(search))
      }
      // console.log('allEditionTemplates', contractState().allEditionTemplates)
      parts = parts.filter(el => contractState().allEditionTemplates.includes(parseInt(el.templateId)))
      return parts
    }
  },
  actions: {
    clearSelected() {
      this.selectedParts = reactive(defaultPartsSet())
    },
    getRandomPartsSet():Record<Elements, number> {
      const partsSet = defaultPartsSet()
      const bps = elementsList
      for (let i = 0; i < bps.length; i++) {
        // const items = atomicState().partsByType[bps[i]] // TODO fix back
        const items = designerState().parts.filter(el => el.type === bps[i])
        if (items.length) {
          const item = items[Math.floor(Math.random() * items.length)]

          // @ts-expect-error TODO refactor needed here
          partsSet[bps[i]] = item.template_id
        }
      }
      return partsSet
    },
    shuffleSelected() {
      const parts = this.getRandomPartsSet()
      this.selectedParts = reactive(parts)
    },
    selectPart(template_id:number, type:Elements) {
      this.selectedParts[type] = template_id
    },
    setTab(tab:Elements) {
      this.activeTab = tab
    },
    addFavorite(name:string, templateIds:Record<Elements, number>) {
      this.favorites[name] = reactive(templateIds)
    },
    loadFavorite(name:string) {
      const existing = this.favorites[name]
      if (existing) this.selectedParts = reactive(deepClone({ ...existing }))
    },
    rmFavorite(name) {
      if (this.favorites[name]) delete this.favorites[name]
    }

  }

})
