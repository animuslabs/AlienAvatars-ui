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
import { Loading, LocalStorage } from 'quasar'
import { contractState } from 'src/stores/ContractStore'
import { atomicState } from 'src/stores/AtomicStore'
import ipfs from 'src/lib/ipfs'
import { CloudWallet } from 'src/lib/cloudWallet'
import { link } from 'src/lib/linkManager'
// @ts-ignore
window.global ||= window

Loading.setDefaults({
  customClass: 'loading'
})

export default defineComponent({
  name: 'App',
  setup() {
    return { atomic: atomicState() }
  },
  data() {
    return {
      loading: false
    }
  },
  async mounted() {
    if (LocalStorage.getItem('lastLogin') === 'cloudWallet') void new CloudWallet().autoLogin()
    else if (LocalStorage.getItem('lastLogin') === 'anchor') void link.try_restore_session()

    this.loading = false
    ipfs()
    this.$q.dark.set(true)
    await contractState().getConfig()
    await contractState().getEditions()
    await this.atomic.getAllTemplates()
    console.log('app mounted')
    await this.atomic.getAccountAssets()
    this.loading = false
  },
  methods: {

  },
  watch: {
    loading(val) {
      if (val) this.$q.loading.show()
      else this.$q.loading.hide()
    }
  }
})
</script>
