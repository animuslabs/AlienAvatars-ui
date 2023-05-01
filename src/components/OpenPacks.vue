<template lang="pug">
div(style="min-height:1000px")
  ClaimCards
  .centered.items-center.q-gutter-md
    h4 My Packs
    q-btn(icon="refresh" @click="getAccountAssets()" :loading="loading" v-if="user.loggedIn.account")
  q-separator(padding)
  .centered
    h5(v-if="!user.loggedIn.account") Login to view and open your packs
  .q-pa-md.q-ma-md(v-for="pack of ownedPacks" v-if="ownedPacks.length > 0")
    .row
      h5(v-if="pack.meta") {{pack.meta.immutableData.name}}
      .col-grow
      h5 You own: {{pack.assetIds.length}}
    q-separator(color="secondary")
    p.q-mb-md.q-mt-sm(v-if="pack.immutableData")
      | Each Pack Contains: {{pack.immutableData.size}} Cards
    .row.no-wrap.relative-position(style="overflow: hidden;")
      .col-auto.relative-position(v-for="asset of pack.assetIds" style="width:40px; margin-left: 20px;")
        q-img.relative-position(:src="pack.imgUrl" v-if="asset" :style="packCardDynamic(asset.toString())")
          //- q-img()
          //- .absolute-center
          //-   q-icon(name="question_mark" size="184px")
      // div {{pack}}
      .absolute-center
        .column.items-center.justify-center
          q-btn.q-ma-md.bg-black( v-if="pack.meta" :label="'open one pack'" size="lg" @click="openPacks(pack,1)")
          q-btn.q-ma-md.bg-black(label="open five packs" size="lg" @click="openPacks(pack,5)" style=" width:200px;" :disable="pack.assetIds.length <5")
        //- q-btn.q-ma-md.bg-black(label="open one pack" size="lg" @click="openPack(pack)" style=" width:200px;")
</template>
<style lang="sass">
.fade-enter-active,
.fade-leave-active
  transition: bottom 1s ease

.fade-enter-from,
.fade-leave-to
  bottom: 0px

</style>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { useUser } from 'src/stores/UserStore'
import { contractState } from 'src/stores/ContractStore'
import { atomicState, TemplateData, PackMeta } from 'src/stores/AtomicStore'
import PackCard from 'src/components/PackCard.vue'
import * as transact from 'src/lib/transact'
import { sleep } from 'src/lib/utils'
import ms from 'ms'
import ClaimCards from 'src/components/AvatarDesigner/ClaimCards.vue'
type OwnedPackType = {templateId:number, assetIds:string[], meta?:TemplateData, immutableData?:PackMeta, imgUrl:string}
let interval
let interval2
let interval3
function getRand(min, max) {
  return Math.random() * (max - min) + min
}
const randCache = <Record<string, number[]>>{}

export default defineComponent({
  setup(props) {
    return { global: globalState(), user: useUser(), link, atomic: atomicState(), contract: contractState() }
  },
  data() {
    return {
      loading: false
    }
  },
  async mounted() {
    this.contract.getPacks()
    if (!this.user.loggedIn.account) return
    await this.getAccountAssets()

    // interval2 = setInterval(this.getAccountAssets, ms('5m'))
    // interval3 = setInterval(this.contract.getUnpacks, ms('30s'))
  },
  unmounted() {
    if (interval) clearInterval(interval)
    if (interval2) clearInterval(interval2)
    if (interval3) clearInterval(interval3)
  },
  methods: {
    packImg(assetId:string):string {
      console.log('packImg:', assetId)

      return 'https://ipfs.animus.is/ipfs/QmPM8rFRTrXUHnZ63C4HQmTGDTWaRbTVEpDPz6RDZtWb1U'
    },
    toggleLoading() {
      this.loading = !this.loading
    },
    packCardDynamic(rand:string) {
      console.log(rand)

      if (!randCache[rand] || randCache[rand].length === 0) randCache[rand] = [getRand(-6, 8), getRand(-15, 15)]
      return {
        height: '300px',
        width: '200px',
        transform: `rotate(${randCache[rand][0]}deg)`,
        margin: '10px',
        'margin-left': `${randCache[rand][1]}px`,
        filter: 'drop-shadow(6px 6px 5px rgba(0,0,0,.5))'
        // 'z-index': 100
      }
    },
    async openPacks(pack:OwnedPackType, quantity:number) {
      const assetIds = pack.assetIds.splice(0, quantity)
      console.log('open pack', assetIds)
      try {
        await transact.openPacks(assetIds)
        // this.atomic.rmAccountAsset(pack.templateId, assetId)
        console.log('pack opened')
      } catch (error) {
        console.error(error)
      }
      await sleep(ms('2s'))
      this.getAccountAssets()
      this.contract.getUnpacks()
    },
    async getAccountAssets() {
      this.toggleLoading()
      try {
        const targetUser = this.user.loggedIn.account
        console.log('get account assets', targetUser)
        if (!targetUser) return this.toggleLoading()
        await this.atomic.getAccountAssets(targetUser)
      } catch (error) {
        console.error(error)
      }
      this.toggleLoading()
    }
  },
  computed: {
    ownedPacks():OwnedPackType[] {
      try {
        const targetUser = this.user.loggedIn.account
        if (!targetUser) return []
        const packTemplates = this.contract.packs[this.global.currentEdition].map(el => parseInt(el.template_id.toString()))
        if (!packTemplates || packTemplates.length === 0) return []

        return packTemplates.map(el => {
          const assetIds = this.atomic.accountAssets[el] || []
          const meta = this.atomic.templateData[el]
          const immutableData = meta.immutableData as PackMeta
          const imgUrl = 'https://ipfs.animus.is/ipfs/' + immutableData.img
          return { templateId: el, assetIds, meta, immutableData, imgUrl } || []
        })
      } catch (error) {
        console.error(error)
        return []
      }
    }
  },
  watch: {
    'user.loggedIn.account'(val) {
      if (val) {
        this.getAccountAssets()
        this.contract.getUnpacks()
      }
    }
  },
  components: { PackCard, ClaimCards }
})
</script>
