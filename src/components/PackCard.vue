<template lang='pug'>
q-card.relative-position(style="display: flex; flex-direction:column;" )
  .row.justify-center
    h6(style="text-transform: capitalize;") {{ pack.pack_name.toString() }}
  q-separator
  q-scroll-area(style="height:100%; overflow: auto;").q-ma-sm
    p Contains Cards:
    h6.no-margin {{ meta.size }}
    p Pack Price
    h6.no-margin {{ pack.floor_price.toString() }}
    p Per Card Price
    h6.no-margin {{ cardPrice }}

</template>
<script lang="ts">
import { Action, AnyAction, Asset, Name } from 'anchor-link'
import { atomicRpc } from 'src/lib/atomic'
import { contractState } from 'src/stores/ContractStore'
import { Buypack, Open, Packs } from 'src/types/avatarContractTypes'
import { Transfer } from 'src/types/eosioTokenTypes'
import { defineComponent, PropType, defineProps } from 'vue'
import { useUser } from 'src/stores/UserStore'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { activeNetwork } from 'src/lib/config'
import { purchasePacks } from 'src/lib/transact'
import { atomicState, PackMeta } from 'src/stores/AtomicStore'
export default defineComponent({
  setup() {
    return { contract: contractState(), user: useUser(), global: globalState(), atomic: atomicState(), link }
  },
  data() {
    return {
    }
  },
  mounted() {
    this.fetchMeta()
  },
  computed: {
    cardPrice(): Asset {
      const cardPrice = Asset.from(this.pack.base_price.toString())
      cardPrice.units.divide(this.meta.size)
      return cardPrice
    },
    meta():PackMeta {
      const empty = { name: '', edition: '', size: 10000000, img: '' }
      try {
        const existing = this.atomic.templateData[this.pack.template_id.toNumber()]
        if (existing) return existing.immutableData as PackMeta
        else return empty
      } catch (error) {
        return empty
      }
    }
  },
  emits: ['purchase'],
  methods: {
    async purchase() {
      try {
        await purchasePacks(this.pack)
        setTimeout(() => this.$emit('purchase'), 3000)
      } catch (error) {
        console.error(error)
      }
    },
    async fetchMeta() {
      atomicState().loadTemplate(parseInt(this.pack.template_id.toString()))
    }
  },
  props: {
    pack: {
      type: Object as PropType<Packs>,
      required: true
    }
  }
})
</script>
<style lang="sass">
</style>
