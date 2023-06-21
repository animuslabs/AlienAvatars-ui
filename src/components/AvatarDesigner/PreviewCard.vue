<template lang='pug'>
q-img(v-if="imgSrc" noTransition :src="imgSrc" placeholder-src="/loadingCard.webp" style="width:122px; min-height:177.3px; margin:5px; filter: drop-shadow(1px 5px 5px rgba(1,1,1,.2) );")
  q-tooltip(anchor="top middle" :offset="[0,300]" ).bg-transparent
    q-img(:src="imgSrc" width="24em" noSpinner noTransition  )

</template>
<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { useUser } from 'src/stores/UserStore'
import { contractState } from 'src/stores/ContractStore'
import { atomicState, TemplateData, PackMeta, PartCardMeta } from 'src/stores/AtomicStore'
import { sleep } from 'src/lib/utils'
import ipfs from 'src/lib/ipfs'
function getRand(min, max) {
  return Math.random() * (max - min) + min
}

export default defineComponent({
  setup(props) {
    return { global: globalState(), user: useUser(), link, atomic: atomicState(), contract: contractState() }
  },
  data() {
    return {
      stuff: ref([] as object[]),
      loading: false,
      loadAssets: false
    }
  },
  props: {
    templateId: { type: Number, required: true }
  },
  async mounted() {
    await sleep(20000)
    this.atomic.loadTemplate(this.templateId)
  },
  unmounted() {
    return
  },
  methods: {

  },
  computed: {
    meta(): TemplateData | undefined {
      return this.atomic.templateData[this.templateId]
    },
    imgSrc(): string | null {
      const data = this.meta?.immutableData
      if (!data || !('avatarpart' in data)) return null
      return ipfs(data.img)
    }
  },
  watch: {

  }
})
</script>
<style lang="sass">

</style>
