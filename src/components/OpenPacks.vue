<template lang="pug">
div(style="min-height:1000px")
  ClaimCards
  .centered.items-center.q-gutter-md
    //- div {{ atomic.accountAssets }}
    h4 My Packs
    q-btn(icon="refresh" @click="getAccountAssets()" :loading="loading" v-if="user.loggedIn.account")
  q-separator
  .centered
    h5(v-if="!user.loggedIn.account") Login to view and open your packs
  .q-pa-md.q-ma-md(v-for="pack of ownedPacks" v-if="ownedPacks.length > 0")
    .row
      h5(v-if="pack.meta") {{pack.immutableData?.name}}
      .col-grow
      h5 You own: {{pack.assetIds.length}}
    q-separator(color="secondary")
    p.q-mb-md.q-mt-sm(v-if="pack.immutableData")
      | Each Pack Contains: {{pack.immutableData.size}} Cards
    .row.no-wrap.relative-position(style="overflow: hidden;")
      .col-auto.relative-position(v-for="asset of pack.assetIds" style="width:40px; margin-left: 20px;").q-ma-md
        q-img.relative-position(:src="pack.imgUrl" v-if="asset" :style="packCardDynamic(asset.toString())" no-transition no-spinner)
          //- q-img()
          //- .absolute-center
          //-   q-icon(name="question_mark" size="184px")
      // div {{pack}}
      .absolute-center
        .column.items-center.justify-center
          q-btn.q-ma-md.bg-black( v-if="pack.meta" :label="'open one pack'" size="lg" @click="openPacks(pack,1)")
          //- q-btn.q-ma-md.bg-black(label="open five packs" size="lg" @click="openPacks(pack,5)" style=" width:200px;" :disable="pack.assetIds.length <5")
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
import ipfs from 'src/lib/ipfs'
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
    console.log('openpacks mounted1')
    this.loading = true
    await sleep(1000)
    await this.contract.getPacks()
    console.log('openpacks mounted2')
    if (!this.user.loggedIn.account) return
    // await this.getAccountAssets()
    // console.log('openpacks mounted3')
    // console.log('get template??????', this.atomic.templateData[621073])

    // await this.atomic.loadTemplate(621073)
    // console.log('got template?', this.atomic.templateData[621073])
    // console.log('openpacks mounted4')
    this.loading = false
    // interval2 = setInterval(this.getAccountAssets, ms('5m'))
    // interval3 = setInterval(this.contract.getUnpacks, ms('30s'))
  },
  unmounted() {
    if (interval) clearInterval(interval)
    if (interval2) clearInterval(interval2)
    if (interval3) clearInterval(interval3)
  },
  methods: {
    toggleLoading() {
      this.loading = !this.loading
    },
    packCardDynamic(rand:string) {
      console.log(rand)
      // @ts-ignore
      if (!randCache[rand] || randCache[rand].length === 0) randCache[rand] = [getRand(-6, 8), getRand(-15, 15)]
      return {
        height: '350px',
        width: '200px',
        // @ts-ignore
        transform: `rotate(${randCache[rand][0]}deg)`,
        margin: '10px',
        // @ts-ignore
        'margin-left': `${randCache[rand][1]}px`,
        filter: 'drop-shadow(6px 6px 5px rgba(0,0,0,.5))'
        // 'z-index': 100
      }
    },
    async openPacks(pack:OwnedPackType, quantity = 1) {
      // const assetIds =
      // assetIds.forEach(el => this.atomic.rmAccountAsset(pack.templateId, el))
      // console.log('open pack', assetIds)
      try {
        await transact.openPacks([pack.assetIds[0]] as string[])
        pack.assetIds.splice(0, 1)
        console.log('pack opened')
      } catch (error) {
        console.error('caught transact error', error)
        console.log(pack.assetIds.length)
      }
      await sleep(ms('3s'))
      // this.getAccountAssets()
      await this.contract.getUnpacks()
    },
    async getAccountAssets() {
      this.loading = true
      try {
        const targetUser = this.user.loggedIn.account
        console.log('get account assets', targetUser)
        if (!targetUser) return this.loading = false
        await this.atomic.getAccountAssets(targetUser)
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    }
  },
  computed: {
    ownedPacks(): OwnedPackType[] {
      if (this.loading) return []
      try {
        const targetUser = this.user.loggedIn.account
        if (!targetUser) return []
        const packTemplates = this.contract.packs[this.global.currentEdition].map(el => parseInt(el.template_id.toString()))
        console.log('PACK TEMPLATES:', packTemplates)

        if (!packTemplates || packTemplates.length === 0) return []

        return packTemplates.map((el) => {
          const assetIds = this.atomic.accountAssets[el] || []
          const meta = this.atomic.templateData[el]
          if (!meta) console.error('missing template:', el)
          let immutableData:PackMeta|null = null
          // @ts-ignore
          immutableData = meta.immutableData as PackMeta || null
          const imgUrl = ipfs(immutableData.img)
          return { templateId: el, assetIds, meta, immutableData, imgUrl } || []
        }).filter(el => el.immutableData)
      } catch (error) {
        console.error(error)
        return []
      }
    }
  },
  watch: {
    async 'user.loggedIn.account'(val) {
      if (val) {
        await this.getAccountAssets()
        await this.contract.getUnpacks()
      }
    }
  },
  components: { PackCard, ClaimCards }
})
</script>
