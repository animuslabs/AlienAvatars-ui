
<template lang="pug">
.full-width.full-height
  //- q-separator(size="3px" color="grey-10")
  q-tabs(v-model="designer.activeTab" v-bind="tabs")
    q-tab(name="top" label="Top")
    q-tab(name="eyes" label="Eyes")
    q-tab(name="head" label="Head")
    q-tab(name="mouth" label="Mouth")
    q-tab(name="torso" label="Torso")
    q-tab(name="big-wings" label="Big Wings")
    q-tab(name="small-wings" label="Small Wings")
    q-tab(name="legs" label="Legs")
  .relative-position(style="display: flex; flex-direction:column; height:88vh; overflow: hidden;"  )
    .centered.relative-position(style="height:10px;")
      filter-options(v-model="designer.filter" style="max-width:950px; z-index: 10;").q-pt-lg.absolute
      div(style="height:2px; width:100%; top:56px; z-index: ;").absolute.bg-secondary
    q-scroll-area(style="height:100%; overflow: auto;").q-ma-sm.q-pl-sm.q-mt-xl
      .gt-xs.full-width(style="height:100px")
      .lt-sm.full-width(style="height:160px")
      .row.justify-center
        part(v-for="p in designer.visibleParts" :bodyPart="p" :key="p.templateId" :ref="p.templateId")
        .column.items-center(v-if="designer.visibleParts.length == 0")
          p You don't own any {{ designer.activeTab }} parts
          url-button.q-mt-sm.pulse(label="Visit Market" url="https://google.com")
      .full-width(style="height:50px")
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mapState, mapActions, mapWritableState, mapStores } from 'pinia'
import part from 'components/AvatarDesigner/AvatarPart.vue'
import filterOptions from 'components/AvatarDesigner/FilterOptions.vue'
import urlButton from 'components/misc/UrlButton.vue'
import { QTabsProps, scroll } from 'quasar'
import { defineComponent, watch, ref, onMounted, Ref } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { atomicState, PartsMeta } from 'src/stores/AtomicStore'
import { designerState } from 'src/stores/DesignerStore'
// import AvatarPartVue from 'components/AvatarDesigner/AvatarPart.vue'

const { getScrollTarget, setVerticalScrollPosition } = scroll

const doc = document.getElementById('')
// const scroller:ScrollLogicalPosition = {}
// takes an element object
function scrollToElement(el:HTMLElement) {
  el.scrollIntoView({ block: 'center', behavior: 'auto', inline: 'center' })
  // const target = getScrollTarget(el)
  // const offset = el.scrollIntoView()
  // const duration = 500
  // setVerticalScrollPosition(target, offset, duration)
}

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
  components: { part, filterOptions, urlButton },
  setup() {
    const stores = { contract: contractState(), atomic: atomicState(), designer: designerState() }

    watch(() => [stores.designer.activeTab, stores.designer.filter.showDetails, stores.contract.config], () => {
      if (!stores.contract.config) return
      if (!stores.designer.filter.showDetails) return
      console.log('TRIGGER UPDATE ISSUED')
      stores.atomic.getManyTemplateStats(stores.designer.visibleParts.map(el => parseInt(el.templateId)))
    }, { immediate: true, deep: false })

    return { ...stores }
  },
  data() {
    return {
      tabs
    }
  },
  mounted() {
    // console.log(this.$refs)
    // const target = this.$refs[415818] as any
    // console.log(target[0].$el)

    // this.designer.$subscribe(el => {
    //   const event:any = el.type
    //   const switchedTab = event.key !== this.designer.activeTab
    //   if (!switchedTab) return
    //   const targetId = this.designer.selectedParts[this.designer.activeTab]
    //   console.log('targetId:', targetId)
    //   if (typeof targetId !== 'number') return
    //   this.$nextTick(() => {
    //     const target = this.$refs[targetId.toString()] as any
    //     try {
    //       scrollToElement(target[0].$el)
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   })
    // })
  },
  watch: {
    'designer.activeTab'(el, prev) {
      const targetId = this.designer.selectedParts[this.designer.activeTab]
      if (typeof targetId !== 'number') return
      this.$nextTick(() => {
        const target = this.$refs[targetId.toString()] as any
        try {
          scrollToElement(target[0].$el)
        } catch (error) {
          console.log(error)
        }
      })
      console.log('watch tab', el, prev)
    }
  }
})
</script>
