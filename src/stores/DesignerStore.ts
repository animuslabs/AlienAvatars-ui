/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-duplicates */
import { defineStore } from 'pinia'
import { link } from 'src/lib/linkManager' // to access rpc for active chain
import { PartCardMeta, PartsMeta, PartCardMetaClass } from 'src/stores/AtomicStore'
import { AvatarPart, defaultSelectedMeta, Elements, elementsList } from 'src/types/avatarParts'
import { reactive, readonly, ref } from 'vue'
import { atomicState } from 'src/stores/AtomicStore'
import allParts from 'src/statics/partsList.json'
import blankParts from 'src/statics/blankParts.json'
import { deepClone } from 'src/lib/utils'

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
  eyes: BodyPartConfig = new BodyPartConfig()
  top: BodyPartConfig = new BodyPartConfig()
  mouth: BodyPartConfig = new BodyPartConfig()
  big_wings: BodyPartConfig = new BodyPartConfig()
  small_wings: BodyPartConfig = new BodyPartConfig()
  torso: BodyPartConfig = new BodyPartConfig()
  legs: BodyPartConfig = new BodyPartConfig()
}

export type FavoritesType = Record<string, Record<Elements, number>>
export class PartsSet {
  'big-wings' = 0
  'small-wings' = 0
  'legs' = 0
  'eyes' = 0
  'top' = 0
  'head' = 0
  'mouth' = 0
  'torso' = 0
}
export class PartsData {
  'big-wings' = new PartCardMetaClass()
  'small-wings' = new PartCardMetaClass()
  'legs' = new PartCardMetaClass()
  'eyes' = new PartCardMetaClass()
  'top' = new PartCardMetaClass()
  'head' = new PartCardMetaClass()
  'mouth' = new PartCardMetaClass()
  'torso' = new PartCardMetaClass()
}

export type FilterType = {sortByRarity:boolean, ownedOnly:boolean, showDetails:boolean, searchName:string|null}
export type DesignerStateType = {
  activeTab:Elements
  selectedParts:Record<Elements, number>
  filter:FilterType,
  activeBookmark:string,
  favorites:FavoritesType,
  createTemplateMode:boolean
}
export type SelectedMetaData = { offset:PartOffset
  rawPath:string
  templateId:number
  rarityScore:number
  name:string
  cardIpfs:string
  part:AvatarPart
}

export type SelectedMetaType = Record<Elements, SelectedMetaData>

export const emptySelectedParts = Object.freeze({ 'big-wings': 0, 'small-wings': 0, legs: 0, eyes: 0, top: 0, head: 0, mouth: 0, torso: 0 })
export const designerState = defineStore({
  id: 'DesignerState',
  state: ():DesignerStateType => ({
    activeTab: 'eyes',
    selectedParts: reactive(new PartsSet()),
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
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage
      }
    ]
  },
  getters: {
    parts():AvatarPart[] {
      return allParts as AvatarPart[]
    },
    selectedMeta():SelectedMetaType {
      const data:SelectedMetaType = deepClone(defaultSelectedMeta)
      for (const [type, templateId] of Object.entries(this.selectedParts)) {
        // console.log(type)

        const part:AvatarPart = allParts.find((el) => el.template_id === templateId) || blankParts[type]
        const templateData = atomicState().templateData[templateId]?.immutableData as PartCardMeta|undefined
        // console.log(part)

        data[type] = {
          offset: part.offset,
          rawPath: `./images/raw/${part.type}/${part.name}.png`,
          templateId,
          rarityScore: templateData?.rarityScore || 1,
          name: templateData?.name || 'malplena',
          cardIpfs: templateData?.img || blankParts[type].ipfsCard,
          part
        }
      }
      return data
    },
    rarityScore():number {
      // return 1
      let res = 0
      for (const [type, templateId] of Object.entries(this.selectedParts)) {
        const templateData = atomicState().templateData[templateId]
        if (!templateData || !('bodypart' in templateData.immutableData)) return (res += 1)
        const data = templateData.immutableData as PartCardMeta
        res += data.rarityScore
      }
      return Math.floor(res / 8)
    },
    visibleParts():PartsMeta[] {
      let parts:PartsMeta[] = deepClone(atomicState().partsByType[this.activeTab])
      // console.log(parts)

      if (this.filter.ownedOnly) {
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
      parts = parts.filter(el => allParts.find((el2) => parseInt(el.templateId) === el2.template_id))
      // console.log(parts)

      return parts
    }
  },
  actions: {
    clearSelected() {
      this.selectedParts = reactive(new PartsSet())
    },
    getRandomPartsSet():Record<Elements, number> {
      const partsSet = new PartsSet()
      const bps = elementsList
      for (let i = 0; i < bps.length; i++) {
        // const items = atomicState().partsByType[bps[i]] // TODO fix back
        const items = designerState().parts.filter(el => el.type === bps[i])
        if (items.length) {
          const item = items[Math.floor(Math.random() * items.length)]
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
