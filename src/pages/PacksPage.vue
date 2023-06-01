<template lang="pug">
q-page
  //- q-separator(size="3px" color="grey-10")
  .row.items-center.justify-center.q-mb-md.bg-primary
    q-tabs(v-bind="tabs" v-model="currentTab")
      q-tab(v-for="tab of nav" v-bind="tab" :key="tab.label")
  //- q-separator(size="5px" color="black")
  .centered
    .col-auto(style="width:95vw; max-width: 1600px;").q-pb-lg
      .row.justify-center(v-if="currentTab == 'buy'")
        .col-auto.full-width
          buy-packs
      .row.justify-center(v-if="currentTab == 'open'")
        .col-auto.full-width
          open-packs

</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { link } from 'src/lib/linkManager'
import { QTabProps, QTabsProps } from 'quasar'
import BuyPacks from 'src/components/BuyPacks.vue'
import OpenPacks from 'src/components/OpenPacks.vue'

const tabs: QTabsProps = {
  activeBgColor: 'secondary',

  indicatorColor: 'transparent',
  narrowIndicator: true,
  inlineLabel: true,
  shrink: true,
  stretch: true,
  contentClass: 'boid-tabs'
}
const nav: QTabProps[] = [
  { icon: 'shopping_cart', label: 'Buy', name: 'buy' },
  { icon: 'view_carousel', label: 'Open', name: 'open' }
]
export default defineComponent({
  data() {
    const currentTab = 'buy'
    return { link, currentTab }
  },
  setup() {
    return { tabs, nav }
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        if (this.$route.name === 'openPacks') this.currentTab = 'open'
        if (this.$route.name === 'buyPacks') this.currentTab = 'buy'
        if (this.$route.name === 'packs') this.$router.replace({ name: 'buyPacks' })
      }
    },
    'currentTab'() {
      if (this.currentTab === 'open') this.$router.replace({ name: 'openPacks' })
      if (this.currentTab === 'buy') this.$router.replace({ name: 'buyPacks' })
    }
  },
  components: { BuyPacks, OpenPacks }
})
</script>
