<template lang="pug">
q-layout.relative-position
  q-header
    q-toolbar
      q-img(src="../assets/header.webp" style="height: 100%; width: 180px")
      .centered.full-width
        q-tabs.gt-sm(v-bind="tabs")
          q-route-tab(v-for="tab of nav" v-bind="tab" :key="tab.label")

      //- q-separator(vertical padding)
      q-btn(v-if="!user.loggedIn.auth" label="login" @click="login")
      q-btn(v-else :icon="`img:${logoImage}`" :label="userAuth" style="width:250px;")
        q-menu(dense separator).no-border-radius
          q-list
            q-item.text-primary.text-weight-bold(clickable v-close-popup @click="login")
              q-item-section(avatar)
                q-icon(name="person_add" color="secondary")
              q-item-section
                q-item-label.text-secondary Add Account
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
    router-view
</template>

<style lang="sass">

.boid-tabs
  color: $grey-1
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
// import LoginButton from '../components/menus/LoginButton.vue'
import { useUser } from 'src/stores/UserStore'
import { getNetworkByChainId } from 'src/lib/config'
import { link } from 'src/lib/linkManager'
import { ChainId, PermissionLevel, PermissionLevelType } from 'anchor-link'
import { QRouteTabProps, QTabsProps } from 'quasar'

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
    return { user: useUser(), link, showDialog: false }
  },
  methods: {
    getNetworkByChainId,
    login() {
      console.log('click login')
      link.login()
    },
    logout() {
      console.log('click logout, delete session')
      link.logout()
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
