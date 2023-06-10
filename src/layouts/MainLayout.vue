<template lang="pug">
q-layout(view="hhh LpR fff").layout
  //- .bg-red(style="height:100px; width:100%")
  q-header
    q-toolbar
      q-img(src="../assets/header.webp" style="height: 100%; width: 180px")
      .centered.full-width
        q-tabs.gt-sm(v-bind="tabs")
          q-route-tab(v-for="tab of nav" v-bind="tab" :key="tab.label")

      //- q-separator(vertical padding)
      q-btn(v-if="!user.loggedIn.auth" label="login" @click="login")
      q-btn(v-else :icon="`img:${logoImage}`" :label="userAuth" style="width:250px;")
        q-menu().no-border-radius
          q-list
            q-item.text-primary.text-weight-bold(clickable v-close-popup @click="logout")
              q-item-section(avatar)
                q-icon(name="logout" color="red")
              q-item-section
                q-item-label.text-white Logout
              q-item-section(side)
            q-separator
            q-item.text-primary.text-weight-bold(clickable v-close-popup @click="login")
              q-item-section(avatar)
                q-icon(name="person_add" color="white")
              q-item-section
                q-item-label.text-white Login
              q-item-section(side)
            q-separator
          q-item(v-close-popup v-for="session in link.getSessions()" :key="session.chainId" clickable)
            q-item-section(avatar)
              q-avatar(:icon="`img:${getNetworkByChainId(session.chainId).logo}`")
            q-item-section.cursor-pointer(@click="link.restore_session(session.auth, session.chainId)")
              q-item-label {{ session.auth.actor }}@{{ session.auth.permission }}
            q-item-section(side)
              q-btn(icon="delete" color="negative" dense size="sm" rounded @click="deleteSession(session.auth, session.chainId)")
    q-toolbar.lt-md.bg-primary
      q-tabs.full-width(v-bind="tabs")
        q-route-tab(v-for="tab of nav" v-bind="tab" :key="tab.label")
    //- q-separator(size="5px" color="black")
    q-separator.absolute-bottom(size="3px" color="secondary" style="bottom:0px")
  q-page-container
    router-view(style="height:10px;")
</template>

<style lang="sass" scoped>

.boid-tabs
  color: $grey-1
.layout
  min-height:100px !important
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
// import LoginButton from '../components/menus/LoginButton.vue'
import { useUser } from 'src/stores/UserStore'
import { getNetworkByChainId } from 'src/lib/config'
import { link } from 'src/lib/linkManager'
import { ChainId, PermissionLevel, PermissionLevelType } from 'anchor-link'
import { Dialog, LocalStorage, QRouteTabProps, QTabsProps } from 'quasar'
import { CloudWallet, waxLink } from 'src/lib/cloudWallet'
// @ts-ignore
window.global ||= window
const tabs: QTabsProps = {
  activeBgColor: 'secondary',

  indicatorColor: 'transparent',
  narrowIndicator: true,
  inlineLabel: true,
  shrink: true,
  stretch: true,
  contentClass: 'boid-tabs'
}
export default defineComponent({
  name: 'MainLayout',
  components: {
  },
  setup() {
    return { tabs }
  },
  data() {
    return { user: useUser(), link, showDialog: false, selectedLogin: 'cloudWallet', cloudWallet: new CloudWallet() }
  },
  methods: {
    getNetworkByChainId,
    login() {
      console.log('click login')
      Dialog.create(
        {
          options: {
            contextmenu: 'hi',
            model: this.selectedLogin,
            title: 'Select Login Method',
            style: 'font-size:30px;',
            radiogroup: 'style="width:40px;"',
            items: [
              { label: 'Cloud Wallet', value: 'cloudWallet' },
              { label: 'Anchor', value: 'anchor' }
            ]

          }
        }).onOk((val) => {
        this.selectedLogin = val
        if (this.selectedLogin === 'anchor') link.login()
        else if (this.selectedLogin === 'cloudWallet') this.cloudWallet.login()
      })
    },
    logout() {
      if (this.user.loginMethod === 'anchor') link.logout()
      else if (this.user.loginMethod === 'cloudWallet') this.cloudWallet.logout()
    },
    deleteSession(permissionlevel: PermissionLevelType, chainId: string) {
      console.log('delete session')
      link.deleteSession(PermissionLevel.from(permissionlevel), ChainId.from(chainId))
    }
  },
  computed: {
    nav():QRouteTabProps[] {
      const nav1: QRouteTabProps[] = [
        { icon: 'home', label: 'Home', to: { name: 'home' } },
        { icon: 'style', label: 'Packs', to: { name: 'openPacks' } },
        { icon: 'design_services', label: 'Designer', to: { name: 'design' } },
        { icon: 'groups', label: 'Avatars', to: { name: 'avatars' } }
      ]
      const nav2: QRouteTabProps[] = [
        { icon: 'home', label: 'Home', to: { name: 'home' } },
        { icon: 'style', label: 'Packs', to: { name: 'buyPacks' } },
        { icon: 'design_services', label: 'Designer', to: { name: 'design' } },
        { icon: 'groups', label: 'Avatars', to: { name: 'avatars' } }
      ]
      if (this.$route.name === 'openPacks') return nav1
      else return nav2
    },
    logoImage(): string {
      if (this.user.getLoggedIn) return this.getNetworkByChainId(this.user.getLoggedIn.chainId).logo
      else return ' '
    },
    userAuth(): string {
      if (this.user.getLoggedIn) return this.user.getLoggedIn?.auth?.actor.toString() || ' '
      else return ' '
    }
  }
})
</script>
