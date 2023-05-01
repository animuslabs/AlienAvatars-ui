<template lang='pug'>
div
  div(v-if="page===1")
    .centered
      h5 Avatar Part Packs
    .centered.q-mr-md.q-ml-md
      p Part Packs contain Avatar parts, needed to design custom Avatar Templates. Packs can be minted here or purchased on the secondary markets.
    .q-pa-md.q-mb-md
      .row
        .col-auto
          h5 Common Packs
        .col-grow
        .col-auto
          q-btn( v-if="contract.config" label="atomic hub" color="cyan-6" icon="link" type="a" target="_blank" :href="atomicHubSchemaMarket(contract.config.pack_schema.toString())")
      q-separator(color="secondary").q-mb-sm
      .row
        p Rarity distribution is the same among all common packs but the price per card is lower for larger packs. Finding rare parts in common packs is not likely.
    .centered.q-gutter-lg
      div(v-for="pack of normalPacks")
        buy-pack-card(:pack="pack" @purchase="initiateBuy")
    .q-ma-md.q-pb-lg.q-mt-xl
      .row
        .col-auto
          h5 Rare Packs
        .col-grow
        .col-auto
          q-btn( v-if="contract.config" label="atomic hub" color="cyan-6" icon="link" type="a" target="_blank" :href="atomicHubSchemaMarket(contract.config.pack_schema.toString())" )
      q-separator(color="secondary").q-mb-sm
      .row
        p Rare packs contain less part cards but guarantee much higher card Rarity Scores than normal packs. Rare packs are also much more limited in supply.
    .centered.q-gutter-lg
      div(v-for="pack of rarePacks")
        buy-pack-card(:pack="pack" @purchase="initiateBuy")
    .centered.items-center(v-if="user.loggedIn.auth").q-pt-lg
      .col-auto.q-mr-md
        p Balance:
      .col-auto
        h6 {{ balanceString }}
    .centered.q-mt-md
      .centered(style="width:90vw; max-width: 690px;")
        .col(style="min-width:300px; max-width:200px")
          //- p.q-ma-md Each pack can be opened to reveal Avatar Part NFT Cards. Avatar Part Cards each have a Rarity Rating which determines the percentage they exist in a pack. Larger packs receive a bulk discount.
  .centered(v-if="page===2")
    div
      .row
        buying-pack(v-if="buyingPack" :packId="buyingPack.template_id.toNumber()" @back="page = 1" :balanceString="balanceString" @balance="updateAll()") {{buyingPack}}

</template>
<script lang="ts">
import { defineComponent, watch } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { ExtendedSymbol, Packs, Queue } from 'src/types/avatarContractTypes'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { useUser } from 'src/stores/UserStore'
import BuyPackCard from 'src/components/BuyPackCard.vue'
import { Asset, Name } from 'anchor-link'
import { atomicState } from 'src/stores/AtomicStore'
import BuyingPack from 'src/components/BuyingPack.vue'
import { atomicHubSchemaMarket } from 'src/lib/utils'

let balanceInterval
type BuyingPackType = Packs | null

export default defineComponent({
  setup(props) {
    return { contract: contractState(), global: globalState(), user: useUser(), atomic: atomicState(), atomicHubSchemaMarket }
  },
  data() {
    return {
      balanceString: 'Loading...',
      link,
      page: 1,
      buyingPack: null as BuyingPackType
    }
  },
  expose: ['page'],
  async mounted() {
    balanceInterval = setInterval(this.updateAll, 10000)
    await this.contract.getPacks()
    this.updateAll()
    // console.log(this.$route.query)
    if (this.$route.query.buyingPack) {
      console.log()
      console.log(this.$route.query.buyingPack)
    }
  },
  unmounted() {
    if (balanceInterval) clearInterval(balanceInterval)
  },
  computed: {
    normalPacks(): Packs[] {
      return this.contract.packs[globalState().currentEdition].filter(el => !el.pack_name.toString().includes('Rare'))
    },
    rarePacks(): Packs[] {
      return this.contract.packs[globalState().currentEdition].filter(el => el.pack_name.toString().includes('Rare'))
    }
  },
  methods: {
    async initiateBuy(pack:Packs) {
      console.log('buying pack:', pack.template_id.toString())
      this.buyingPack = pack
      this.page = 2
    },
    async updateAll() {
      console.log('updateAll')
      this.upddateStats()
      this.updateBalance()
    },
    async upddateStats() {
      this.atomic.getManyTemplateStats(this.contract.packs[this.global.currentEdition].map(el => el.template_id.toNumber()))
    },
    async updateBalance() {
      const payment = this.contract.config?.payment_token || ExtendedSymbol.from({ contract: 'boidcomtoken', sym: '4,BOID' })
      console.log('params', [payment.contract.toString(), this.user.loggedIn.auth?.actor.toString() || '', payment.sym.toString()])
      const result = await this.link.rpc.get_table_rows({ code: payment.contract, table: 'accounts', limit: 1, scope: Name.from(this.user.loggedIn.account || 'boidcomtoken') })
      console.log('balance:', result.rows[0])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.rows[0]) this.balanceString = result.rows[0].balance.toString()
      else this.balanceString = Asset.from('0.0000 BOID').toString()
    }
  },
  components: { BuyPackCard, BuyingPack }
})
</script>
<style lang="sass">
</style>
