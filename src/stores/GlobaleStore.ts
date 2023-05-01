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
      currentEdition: 'cartoon',
      paymentToken: { contract: 'boidcomtoken', symbol: '4,BOID' }
    }
  },
  getters: {
    typedCurrentEdition():Name { return Name.from(this.currentEdition) }
  },
  actions: {
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage
      }
    ]
  }
})
