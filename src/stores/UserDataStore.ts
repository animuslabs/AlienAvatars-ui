import { Asset, AssetType, ExtendedAsset, NameType } from 'anchor-link'
// import { } from "anchor-link"
import { defineStore } from 'pinia'
import { link } from 'src/lib/linkManager' // to access rpc for active chain
import { getLogoForToken } from 'src/statics/tokens'
import { designerState } from 'src/stores/DesignerStore'
import { useUser } from 'src/stores/UserStore'
import { Deposits } from '../types/avatarContractTypes'


class InitState {
  account:NameType|null = null
  deposits:ExtendedAsset[] = []
  avatarTemplates: object[] = []
  counter = 0
}

interface UserDeposit {
  symbol:string
  amount:number,
  precision:number,
  contract:string,
  logo:string
}

export const useUserData = defineStore('UserData', {
  state: () => new InitState(),
  getters: {
    getUserDeposits():UserDeposit[] {
      const mapped = this.deposits.map(deposit => {
        const symbol = deposit.quantity.symbol.toString()
        const data:UserDeposit = {
          symbol,
          amount: deposit.quantity.value,
          precision: deposit.quantity.symbol.precision,
          contract: deposit.contract.toString(),
          logo: getLogoForToken(deposit.contract.toString(), symbol.toString())
        }
        return data
      })
      return mapped || []
    },
    getHasOpenAccount():(contract:string, symbol:string)=>boolean {
      return (contract:string, symbol:string) => {
        const result = this.getUserDeposits.find(el => el.contract === contract && el.symbol === symbol)
        return !!result
      }
    }
  },
  actions: {
    async loginRoutine(account_name) {
      console.log('login routine')
      this.fetchAccount(account_name)
    },
    async logoutRoutine() {
      console.log('logout routine')
      this.$reset()
    },

    async fetchUserDeposits(account_name):Promise<Deposits[]> {
      const res = await link.rpc.get_table_rows({
        // type:Deposits,
        code: 'env.contractAccount',
        scope: account_name,
        table: 'deposits',
        limit: 9999
      })
      return res.rows
    },
    async fetchAccount(account_name) {
      const res = await link.rpc.get_account(account_name)
      this.account = res.account_name.toString()
    }
  }
})
