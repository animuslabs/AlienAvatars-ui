<template lang='pug'>
.row
  .col
    q-card.relative-position(style="display: flex; flex-direction:column; min-width:220px;" ).full-width.full-height.bg-grey-10
      .row
        .col-auto
          q-img(v-if="!statsOnly" :src="imgUrl" style="width:170px;" noSpinner).q-ma-md.q-ml-lg
        .col-auto.q-ma-md.q-mr-lg
          .row.justify-center
            h5(style="text-transform: capitalize;") {{ pack.pack_name.toString() }}
          q-separator(color="primary")
          div(style="height:100%; overflow: auto;").q-ma-sm.q-pl-sm
            p Contains Cards:
            h6.no-margin {{ meta.size }}
            p Pack Price
            h6.no-margin {{ printAsset(pack.floor_price) }}
            p Per Card Price
            h6.no-margin {{ cardPrice }}
            p Minted:
            h6.no-margin {{ availableString }}
      .row.justify-center.bg-accent
        q-btn( v-if="!statsOnly" :label="buyLabel" @click="purchase()"  :disable="disableBuy" icon="payments").full-width.bg-accent.text-cyan-9
        q-tooltip(v-if="!user.loggedIn.account")
          h6 Login required

</template>
<script lang="ts">
import { Action, AnyAction, Asset, Name } from 'anchor-link'
import { contractState } from 'src/stores/ContractStore'
import { Buypack, Open, Packs } from 'src/types/avatarContractTypes'
import { Transfer } from 'src/types/eosioTokenTypes'
import { defineComponent, PropType, defineProps } from 'vue'
import { useUser } from 'src/stores/UserStore'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { activeNetwork } from 'src/lib/config'
import * as transact from 'src/lib/transact'
import { atomicState, PackMeta } from 'src/stores/AtomicStore'
import { printAsset, sleep } from 'src/lib/utils'
import ms from 'ms'
import ipfs from 'src/lib/ipfs'

export default defineComponent({
  setup() {
    return { printAsset, contract: contractState(), user: useUser(), global: globalState(), link }
  },
  data() {
    return {
      assets: [] as object[],
      atomic: atomicState()
    }
  },
  mounted() {
    setTimeout(this.fetchMeta, 3000)
  },
  computed: {
    soldOut(): boolean {
      const templateId = this.pack.template_id.toNumber()
      const stats = this.atomic.templateStats[templateId]
      const maxSupply = this.atomic.templateData[templateId]?.maxSupply
      if (!stats || !maxSupply) return false
      if (stats.issued >= maxSupply) return true
      else return false
    },
    buyLabel(): string {
      if (this.soldOut) return 'Sold Out'
      else return 'obtain'
    },
    availableString(): string {
      const templateId = this.pack.template_id.toNumber()
      return ` ${(this.atomic.templateStats[templateId]?.issued.toString() || '0')} / ${(this.atomic.templateData[templateId]?.maxSupply?.toString() || '0')} Max `
    },
    disableBuy(): boolean {
      return !this.user.loggedIn.account || this.soldOut
    },
    cardPrice(): string {
      const cardPrice = Asset.from(this.pack.base_price.toString())
      cardPrice.units.divide(this.meta.size)
      return printAsset(cardPrice)
    },
    meta(): PackMeta {
      const empty = { name: '', edition: '', size: 10, img: '', rarities: [] }
      try {
        const existing = this.atomic.templateData[this.pack.template_id.toNumber()]
        if (existing) return existing.immutableData as PackMeta
        else return empty
      } catch (error) {
        return empty
      }
    },
    imgUrl(): string { return ipfs(this.meta.img) }
  },
  emits: ['purchase'],
  methods: {

    async purchase() {
      try {
        this.$emit('purchase', this.pack)
        // await transact.purchasePack(this.pack)
        // await sleep(ms('3s'))
        // this.atomic.getAccountAssets()
      } catch (error) {
        console.error(error)
      }
    },
    async fetchMeta() {
      if (!this.contract.config) return
      void this.atomic.loadTemplate(parseInt(this.pack.template_id.toString()))
    }
  },
  props: {
    pack: {
      type: Object as PropType<Packs>,
      required: true

    },
    statsOnly: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    'contract.config'() {
      console.log('get pack meta:', this.pack.pack_name.toString())
      void this.fetchMeta()
    }
  }
})
</script>
<style lang="sass">
</style>
