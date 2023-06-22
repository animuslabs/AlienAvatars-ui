
<template lang='pug'>
div.relative-position
  .absolute-position.dimmed.full-width.full-height(v-if="fullLoading").z-top
    q-spinner( size="200px").absolute-center
  .row.q-ma-md
  .row.q-gutter-lg
    .col-auto(style="width:220px; height:300px;").relative-position
      .absolute-center(style="width: 230px; height:300px;")
        q-img(:src="imgUrl" v-for="card of quantity" no-spinner no-transition :style="packCardDynamic(card.toString())" ).q-mt-xl

    BuyPackCard(:pack="pack" statsOnly).q-pt-lg
    .col-auto.q-pa-sm.q-pt-xl
      .row
        .col-auto.q-ml-lg
          h5 Rarity
        .col(style="margin-left:100px;")
          h5 Chance
      div(v-for="rarity, index of rarities")
        .row.full-width
          .col(style="width:100px;")
            h6.q-ml-lg {{ getRarityName(index + 1)  }}
          .col(style="margin-left:65px;")
            h6.q-ml-md {{ rarity }}%
      p(style="max-width:260px;").q-ma-md The rarity percentages show above are the percent change that each card in the pack is of a certain rarity.
  .centered.items-center(style="margin-top:80px;")
    .col-auto
      h5 {{purchaseString}}
    .col-auto
  .centered.q-mt-md
    .row.q-mb-md
      q-btn(icon="remove"  @click="quantity--" :disable="disableMinus" size="lg")
      q-separator(vertical color="secondary")
      q-btn(icon="add" @click="quantity++" size="lg")
  .centered.q-mt-sm
    q-btn(:label="buyBtn" color="black" size="lg" @click="purchasePacks()").bg-accent
  .centered.items-center(v-if="user.loggedIn.auth").q-pt-lg
    .col-auto.q-mr-md
      p Balance:
    .col-auto
      h6 {{ balanceString }}
    .col-auto
      q-btn(icon="refresh" @click="loadBalance()" :loading="loading")
  //- .centered.q-pt-lg.q-gutter-md
    .col-auto
      .centered.items-center(v-if="user.loggedIn.auth")
        .col-auto.q-mr-md
          p Quick swap TLM
      .centered.items-center(v-if="user.loggedIn.auth")
        .col-auto
          q-btn(label="5 WAX" @click="swap(5)")
          q-btn(label="10 WAX" @click="swap(10)")
    //- q-separator(vertical)
    .col-auto
      .centered.items-center
        .col-auto.q-mr-md
          p Exchanges
      .centered.items-center
        .col-auto
          q-btn(label="Defibox" type="a" href="https://eos.defibox.io/marketDetail/8" target="_blank")
          q-btn(label="Newdex" type="a" href="https://newdex.io/trade/boidcomtoken-boid-eos" target="_blank" )
  .centered.q-mt-lg
    q-btn(label="< back" color="grey-5" @click="$emit('back')")

</template>
<script lang="ts">
import { defineComponent, PropType, watch } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { Packs, Queue } from 'src/types/avatarContractTypes'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { useUser } from 'src/stores/UserStore'
import BuyPackCard from 'src/components/BuyPackCard.vue'
import { Asset } from 'anchor-link'
import { atomicState, PackMeta } from 'src/stores/AtomicStore'
import * as transact from 'src/lib/transact'
import { ndxSwap } from 'src/lib/transact'
import { deepClone, getRarityName, sleep } from 'src/lib/utils'
import ipfs from 'src/lib/ipfs'
import ms from 'ms'
const defaultPack = Packs.from({ template_id: 0, base_price: '1 BOID', floor_price: '1 BOID', last_sold: new Date(), pack_name: '', rarity_distribution: [] })
function getRand(min, max) {
  return Math.random() * (max - min) + min
}
const randCache = <Record<string, number[]>>{}
export default defineComponent({
  setup(props) {
    return { getRarityName, contract: contractState(), global: globalState(), user: useUser(), atomic: atomicState(), ndxSwap }
  },
  emits: ['back', 'balance'],
  data() {
    return {
      quantity: 1,
      loading: false,
      fullLoading: false
    }
  },
  props: {
    packId: {
      type: Number,
      required: false,
      default: 0
    },
    balanceString: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    buyBtn(): string {
      return `${this.buyPrice}`
    },
    disableMinus(): boolean {
      return this.quantity === 1
    },
    purchaseString(): string {
      return `Obtain ${this.quantity} ${this.pack.pack_name.toString()} ${this.quantity > 1 ? 'packs' : 'pack'}`
    },
    pack(): Packs {
      return this.contract.packs[this.global.currentEdition].find(el => el.template_id.toNumber() === this.packId) || defaultPack
    },
    rarities(): number[] {
      // const template = this.atomic.getTemplate(this.pack.template_id.toNumber(), false)
      const template = this.atomic.templateData[this.pack.template_id.toNumber()]
      if (!template) return []
      const data = deepClone(template.immutableData as PackMeta)
      console.log(data)
      const reversed = data.rarities.reverse()
      console.log('reversed', reversed)

      return reversed
    },
    cardPrice(): Asset {
      const cardPrice = Asset.from(this.pack.base_price.toString())
      cardPrice.units.divide(this.meta.size)
      return cardPrice
    },
    buyPrice(): Asset {
      // const cardPrice = Asset.from(this.pack.base_price)
      // cardPrice.units.multiply(this.quantity)
      return Asset.from(this.pack.base_price.value * this.quantity, this.pack.base_price.symbol)
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
  methods: {
    async loadBalance() {
      this.loading = true
      this.$emit('balance')
      await sleep(2000)
      this.loading = false
    },
    async swap(quantiy: number) {
      await ndxSwap(quantiy)
      this.loading = true
      await sleep(7000)
      this.$emit('balance')
      await sleep(2000)
      this.loading = false
    },
    packCardDynamic(rand: string) {
      console.log(rand)
      // @ts-ignore
      if (!randCache[rand] || randCache[rand].length === 0) randCache[rand] = [getRand(-12, 12), getRand(-15, 15)]
      return {
        // @ts-ignore
        transform: `rotate(${randCache[rand][0]}deg) scale(${parseInt(rand) * 0.02 + 1.1})`,
        position: 'absolute',
        top: '0px',
        width: '200px',
        filter: 'drop-shadow(5px 5px 5px rgba(0,0,0,.3))'
      }
    },
    async purchasePacks() {
      this.$q.loading.show()
      try {
        await transact.purchasePacks(this.pack, this.quantity)
        await sleep(ms('3s'))
        await this.atomic.getAccountAssets()
        await this.$router.push({ name: 'openPacks' })
      } catch (error) {
        console.log(error)
      }
      this.$q.loading.hide()
    }
  },
  components: { BuyPackCard }
})
</script>
<style lang="sass">
</style>
