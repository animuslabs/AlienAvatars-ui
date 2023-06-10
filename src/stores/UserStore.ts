import { defineStore } from 'pinia'
import { LinkSession, NameType, PermissionLevelType } from 'anchor-link'
import { reactive, shallowReactive } from 'vue'
class LoggedInState {
  account: null | string = null
  auth: null | PermissionLevelType = null
  chainId: null | string = null
  wallet: null | NameType = null
}

type LoginMethods = 'anchor' | 'cloudWallet'

export const useUser = defineStore({
  id: 'User',
  state: () => (reactive({ loggedIn: new LoggedInState(), loginMethod: 'cloudWallet' as LoginMethods })),

  getters: {
    getLoggedIn: (state) => {
      const t = state.loggedIn.account != null
      return t ? state.loggedIn : false
    }
  },
  actions: {
    setUser(session: LinkSession | false) {
      if (!session) {
        this.loggedIn = { account: null, auth: null, chainId: null, wallet: null }
      } else {
        console.log('set user', session)
        // this.loggedIn
        this.loggedIn.account = session ? session.auth.actor.toString() : null
        this.loggedIn.auth = session ? session.auth : null
        this.loggedIn.chainId = session ? session.chainId.toString() : null
        this.loggedIn.wallet = session ? session.metadata.name : null
        console.log(this.loggedIn)
      }
    }
  }
})
