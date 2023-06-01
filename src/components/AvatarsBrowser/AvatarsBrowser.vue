
<template lang="pug">
.full-height
  .relative-position(style="display: flex; flex-direction:column;" )
    .centered.relative-position(style="height:10px;")
      filter-options(v-model="designer.filter" style="max-width:950px; z-index: 100;").q-pt-lg.absolute
      div(style="height:2px; width:100%; top:56px; z-index: ;").absolute.bg-secondary
    q-scroll-area(style="height:100vh; overflow: auto;").q-ma-sm.q-pl-sm.q-mt-xl
      .gt-xs.full-width(style="height:100px")
      .lt-sm.full-width(style="height:160px")
      .centered
        avatar-row(v-for="(avatar,name) in browser.visibleAvatars" :avatar="avatar" :key="avatar.meta.name" @minted="getData()" ).q-ma-md
      .full-width(style="height:50px")

</template>

<script lang="ts">

import { mapState, mapActions, mapWritableState, mapStores } from 'pinia'
import part from 'components/AvatarDesigner/AvatarPart.vue'
import filterOptions from 'components/AvatarsBrowser/AvatarsBrowserFilter.vue'
import urlButton from 'components/misc/UrlButton.vue'
import { QTabsProps } from 'quasar'
import { defineComponent, watch, watchEffect } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { atomicState, PartsMeta } from 'src/stores/AtomicStore'
import { designerState } from 'src/stores/DesignerStore'
import { avatarBrowserState } from 'src/stores/AvatarBrowserStore'
import AvatarRow from 'src/components/AvatarsBrowser/AvatarRow.vue'
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
  components: { part, filterOptions, urlButton, AvatarRow },
  setup() {
    return { contract: contractState(), atomic: atomicState(), designer: designerState(), browser: avatarBrowserState() }
  },
  data() {
    return {
      tabs
    }
  },
  created() {
    this.getData()
    this.browser.filter.creatorName = null
  },
  methods: {
    async getData() {
      console.log('refresh all data')
      await this.contract.getConfig()
      await this.contract.getEditions()
      this.atomic.getAccountAssets()
      this.contract.getAvatars()
      this.atomic.getManyTemplateStats(Object.keys(this.browser.visibleAvatars).map(el => parseInt(el)))
    }
  },
  watch: {
    'browser.visibleAvatars'() {
      console.log('update templateStats')
      this.atomic.getManyTemplateStats(Object.keys(this.browser.visibleAvatars).map(el => parseInt(el)))
    }
  }

})
</script>
