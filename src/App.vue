<template lang="pug">
//- div {{atomic.partsByType['big-wings'].length}}
//- q-btn(@click="atomic.getAllTemplates()" label="get all templates")
router-view
</template>

<style lang="sass">

.loading
  font-size: 40px
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCounterStore } from 'stores/example-store'
import { Loading } from 'quasar'
import { contractState } from 'src/stores/ContractStore'
import { atomicState } from 'src/stores/AtomicStore'
import { atomicRpc } from 'src/lib/atomic'
import ipfs from 'src/lib/ipfs'

Loading.setDefaults({
  customClass: 'loading',
  message: 'heyo'
})

if (import.meta.hot) {
  import.meta.hot.on(
    'vite:beforeUpdate',
    () => console.clear()
  )
}

export default defineComponent({
  name: 'App',
  setup() {
    return { atomic: atomicState() }
  },
  data() {
    return {}
  },
  async mounted() {
    ipfs()
    this.$q.dark.set(true)
    await contractState().getConfig()
    await this.atomic.getAllTemplates()
  },
  methods: {

  }
})
</script>
