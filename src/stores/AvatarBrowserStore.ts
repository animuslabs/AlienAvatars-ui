import { Asset } from 'anchor-link'
import { defineStore } from 'pinia'
import { calculateMintPrice } from 'src/lib/pricing'
import { atomicState, AvatarMeta, TemplateData, TemplateStats } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import { globalState } from 'src/stores/GlobaleStore'
import { Avatars } from 'src/types/avatarContractTypes'

export class BrowserFilterParams {
  ownedOnly = false
  sortMethod = ''
  sortDescending = false
  showDetails = true
  searchName: null |string = null
  showRarities: number[] = [1, 2, 3, 4, 5]
  sortByRarity = true
  sortByPrice = true
  creatorName: null|string = null
}

export type AvatarBrowserType = {
  row:Avatars
  meta:AvatarMeta
  stats:TemplateStats
  price:Asset
}
class BrowserStateType {
  selectedName:string|null = null
  filter:BrowserFilterParams = new BrowserFilterParams()
}

export const avatarBrowserState = defineStore('avatarBrowser', {
  state: ():BrowserStateType => ({ ...new BrowserStateType() }),
  getters: {
    selectedData():AvatarBrowserType | null {
      if (!this.selectedName) return null
      return this.visibleAvatars[this.selectedName]
    },
    visibleAvatars():AvatarBrowserType[] {
      const avatarsRecord:Record<string, AvatarBrowserType> = {}
      const edition = contractState().editions.find(el => el.edition_scope.toString() === globalState().currentEdition)
      if (!edition) return []
      for (const row of contractState().avatars[globalState().currentEdition]) {
        const templateId = row.template_id.toNumber()
        const templateData = atomicState().templateData[templateId]
        if (!templateData) continue
        const meta = templateData.immutableData as AvatarMeta
        const stats = atomicState().templateStats[templateId] || { burned: 0, issued: 0 }
        const price = calculateMintPrice(row, edition.avatar_floor_mint_price)
        if (!price) continue
        avatarsRecord[row.avatar_name.toString()] = { meta, row, stats, price: price.price.mint_price }
      }
      let list:AvatarBrowserType[] = Object.values(avatarsRecord)
      if (this.filter.ownedOnly) list = list.filter(el => atomicState().accountAssets[el.row.template_id.toNumber()])

      if (this.filter.sortByPrice) {
        list.sort((a, b) => (a.price.value < b.price.value ? 1 : -1))
      } else {
        list.sort((a, b) => (a.price.value > b.price.value ? 1 : -1))
      }
      if (this.filter.searchName !== null) {
        const search = this.filter.searchName
        list = list.filter(el => el.row.avatar_name.toString().includes(search))
      }
      if (this.filter.creatorName !== null) {
        const search = this.filter.creatorName
        console.log(search)
        list = list.filter(el => el.row.creator.toString() === search)
      }
      return list
    },
    ownedAvatars():AvatarBrowserType[] {
      const avatarsRecord:Record<string, AvatarBrowserType> = {}
      const edition = contractState().editions.find(el => el.edition_scope.toString() === globalState().currentEdition)
      if (!edition) return []
      for (const row of contractState().avatars[globalState().currentEdition]) {
        const templateId = row.template_id.toNumber()
        const templateData = atomicState().templateData[templateId]
        if (!templateData) continue
        const meta = templateData.immutableData as AvatarMeta
        const stats = atomicState().templateStats[templateId] || { burned: 0, issued: 0 }
        const price = calculateMintPrice(row, edition.avatar_floor_mint_price)
        if (!price) continue
        avatarsRecord[row.avatar_name.toString()] = { meta, row, stats, price: price.price.mint_price }
      }
      let list:AvatarBrowserType[] = Object.values(avatarsRecord)
      list = list.filter(el => atomicState().accountAssets[el.row.template_id.toNumber()])
      return list
    }
  },
  actions: {
    selectAvatar(avatarName:string) {
      this.selectedName = avatarName
    }
  }
})
