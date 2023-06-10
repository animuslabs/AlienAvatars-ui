/* eslint-disable import/first */
// @ts-ignore
window.global ||= window

import * as waxjs from '@waxio/waxjs/dist'
import { PermissionLevel } from 'anchor-link'
import { Pinia } from 'pinia'
import { LocalStorage } from 'quasar'
import { activeNetwork } from 'src/lib/config'
import { useUser } from 'src/stores/UserStore'

export const waxLink = new waxjs.WaxJS({ rpcEndpoint: activeNetwork().nodeUrl, tryAutoLogin: true, userAccount: 'sauce' })

export class CloudWallet {
  userStore: ReturnType<typeof useUser>
  constructor() {
    this.userStore = useUser()
  }

  async login() {
    await waxLink.login()
    this.updateStore()
  }

  async logout() {
    await waxLink.logout()
    this.userStore.setUser(false)
    LocalStorage.remove('lastLogin')
  }

  updateStore() {
    this.userStore.loggedIn = {
      account: waxLink.userAccount,
      auth: PermissionLevel.from(waxLink.userAccount + '@active'),
      chainId: activeNetwork().chainId,
      wallet: 'cloudWallet'
    }
    this.userStore.loginMethod = 'cloudWallet'
    LocalStorage.set('lastLogin', 'cloudWallet')
  }

  async autoLogin() {
    const isAutoLoginAvailable = await waxLink.isAutoLoginAvailable()
    if (!isAutoLoginAvailable) return
    const userAccount = waxLink.userAccount
    const pubKeys = waxLink.pubKeys
    const str = 'AutoLogin enabled for account: ' + userAccount + '<br/>Active: ' + pubKeys[0] + '<br/>Owner: ' + pubKeys[1]
    this.updateStore()
  }
}
