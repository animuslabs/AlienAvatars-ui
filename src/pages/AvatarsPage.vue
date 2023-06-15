<template lang="pug">
q-layout.bg-primary
  q-separator(size="2px" color="grey-10")
  //- div {{ atomic.ownedAwToolsByRarity }}
  q-tabs(v-bind="tabs" @click="getData()")
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
  activeColor: 'white',
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
    async getData() {
      console.log('getData called');

      // await this.contract.getEditions()
      await this.contract.getAvatars()
      void this.atomic.getAccountAssets()
      // this.atomic.getAllTemplates()
      // this.atomic.getAccountAssets()
    }
  },
  watch: {
    'atomic.initialized': {
      handler() {
        void this.getData()
      },
      immediate: true
    }
  }
})
</script>
