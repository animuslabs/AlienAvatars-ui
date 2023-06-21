import { Asset, Name, NameType } from 'anchor-link'
import { defineStore } from 'pinia'
import { Edition } from 'src/stores/ContractStore'
import { shallowReactive, toRaw } from 'vue'
interface GlobalStateData {
  currentEdition:Edition
  paymentToken:{contract:string, symbol:string}
}

export const globalState = defineStore({
  id: 'global',
  state():GlobalStateData {
    return {
      currentEdition: 'first',
      paymentToken: { contract: 'alien.worlds', symbol: '4,TLM' }
    }
  },
  getters: {
    typedCurrentEdition():Name { return Name.from(this.currentEdition) }
  },
  actions: {
  }

})
