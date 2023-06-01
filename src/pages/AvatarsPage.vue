<template lang="pug">
q-layout
  //- q-separator(size="3px" color="grey-10")
  q-tabs(v-bind="tabs")
    q-route-tab(label="browse" :to="{name:'browseAvatars'}")
    q-route-tab(label="inventory" :to="{name:'avatarInventory',params:{accountName:user.loggedIn.account||'eosio'}}")
  router-view
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { atomicState } from 'src/stores/AtomicStore'
import { globalState } from 'src/stores/GlobaleStore'

import { useUser } from 'src/stores/UserStore'
import { QTabsProps } from 'quasar'

const tabs: QTabsProps = {
  activeBgColor: 'secondary',
  activeColor: 'primary',
  indicatorColor: 'transparent',
  narrowIndicator: true,
  inlineLabel: true,
  shrink: true,
  stretch: true,
  contentClass: 'boid-tabs'
}
export default defineComponent({
  setup() {
    return { contract: contractState(), atomic: atomicState(), global: globalState(), user: useUser(), tabs }
  },
  mounted() {
    // this.getData()
  },
  methods: {
    getData() {
      this.contract.getEditions()
      this.contract.getAvatars()
      // this.atomic.getAllTemplates()
      // this.atomic.getAccountAssets()
    }
  }
})
</script>
