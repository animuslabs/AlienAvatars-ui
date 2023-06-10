<template lang="pug">
.centered
  q-card(:style="rowStyle").bg-grey-10
    .absolute-right(v-if="!browser.filter.showDetails")
      q-btn(icon="info" @click="showDetails = !showDetails")
    .q-pa-xs.bg-secondary.relative-position
      .row.q-pr-sm.full-width
        .row.items-center.q-gutter-md.full-width
          //- p.text-capitalize Avatar Template
          .row.no-wrap
            h5.text-capitalize.q-pr-sm.no-margin(:style="rarityStyle") {{ avatar.meta.rarity  }}
            h5.text-capitalize.no-margin {{ avatar.row.avatar_name }}
          .col-grow
          .row.no-wrap
            p Designer:
          .row.no-wrap
            h5.no-margin {{ avatar.row.creator }}
      .titleBar.absolute-top(style="height:100%; width:100%;")

    .row.q-mt-md
      .col-auto.q-pl-md
        q-img(:src="image" style="width:300px;")
      .col-auto(v-if="showDetails")
        .q-pa-sm
          h5.text-center Traits
          q-separator(color="secondary")
          q-list.q-ma-md
            div(v-for="element of elementsList")
              .row
                p.text-capitalize {{ element }}
              .row
                a(:href="atomicHubTemplate(partsMeta[element].templateId)" target="_blank").text-grey-4
                  h6.text-capitalize {{ getRarityName(partRarity[element])  }} {{ avatar.meta[element] }}
      .col-auto.relative-position
        .q-pa-sm.q-ml-lg
          div(v-if="showDetails" style="min-width:200px;")
            h5.text-center Mint
            q-separator(color="secondary")
            .row.q-mt-md
              p Last Mint
            .row
              h5 {{timeAgo.format(avatar.row.modified.toDate())}}
              q-tooltip
                p {{avatar.row.modified.toDate().toLocaleString()}}
            .row.q-mt-sm
              .col
                .row
                  p Minted
                .row
                  h5 {{mintedString}}
              .col
                .row
                  p Burned
                .row
                  h5 {{avatar.stats.burned}}
            //- .row.q-mt-sm
            //-   .col
            //-     .row
            //-       p Last Purchase:
            //-     .row
            //-       h5 {{avatar.row.}}
            .row.q-mt-sm
              p Atomic Hub
            .row.q-mt-sm
            .col-auto
              q-btn(label="template" :href="atomicTemplate" type="a" icon="link" target="_blank" size="md")
              //- q-separator(vertical spaced color="secondary")
            .col-auto
                q-btn(label="market" :href="atomicMarket" type="a" icon="link" target="_blank" size="md")
            //- q-separator(spaced color="secondary")
            .absolute(style="bottom:70px; left:25px;")
              //- q-separator(color="secondary").q-mt-md
              .row.q-mt-sm
                p Price
                div(v-if="!maxSupplyReached")
              .centered
                h5 {{mintPrice}}
            .centered.full-width.q-mt-lg
              q-btn.absolute.relative-position(:label="mintButtonText" size="lg" @click="mintAvatar()" no-wrap :disable="disableMint" color="accent" :flat="false" style=" width:250px; right:-2px; bottom: -2px; background-color: black;").text-cyan-9
                .actionBar.absolute-top(style="height:100%; width:100%;")
              q-tooltip(v-if="!user.loggedIn.account")

      .centered.full-width(v-if="!showDetails")
        h5 {{mintPrice}}
      .centered.full-width.q-mt-sm(v-if="!showDetails").bg-accent
        q-btn(:label="mintButtonText" size="lg" @click="mintAvatar()" :disable="disableMint" color="accent" :flat="false" style=" bottom: 0px; background-color: black;").text-cyan-9
      .q-mt-sm
</template>

<script lang="ts">
import { atomicState, PartCardMeta } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import { defineComponent, PropType } from 'vue'

import { Asset } from 'anchor-link'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { QImg } from 'quasar'
import { activeNetwork } from 'src/lib/config'
import ipfs from 'src/lib/ipfs'
import { calculateMintPrice } from 'src/lib/pricing'
import { atomicHubTemplate, downloadImage, getRarityName, mintAvatar, sleep } from 'src/lib/utils'
import { avatarBrowserState, AvatarBrowserType } from 'src/stores/AvatarBrowserStore'
import { defaultPartsSet } from 'src/stores/DesignerStore'
import { useUser } from 'src/stores/UserStore'
import { Elements, elementsList } from 'src/types/avatarParts'
import ms from 'ms'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')
export default defineComponent({
  setup() {
    return { getRarityName, elementsList, atomicHubTemplate, contract: contractState(), atomic: atomicState(), timeAgo, browser: avatarBrowserState(), user: useUser(), ipfs }
  },
  props: {
    avatar: {
      type: Object as PropType<AvatarBrowserType>,
      required: true
    }
  },
  data() {
    return {
      disableMint: false,
      showFull: false,
      show: true,
      image: '',
      showDetails: false
    }
  },
  emits: ['minted'],
  async mounted() {
    this.image = await this.imgUrl()
    // const img = this.$refs.avatarImage as QImg
    // console.log(img.$)
    // img.src = await this.imgUrl()
    // console.log('mounted AvatarRow', this.avatar?.meta.name)
  },
  computed: {
    rarityStyle(): string {
      // const color = getRarityColor(this.avatar.meta.rarity.toLowerCase())
      const color = 'white'
      return 'color:' + color + ';' + ' text-shadow: 1px 1px 8px #3A6BF1;'
    },
    rowStyle() {
      return this.showDetails ? 'max-width:100%;' : 'max-width:330px;'
    },
    maxSupplyReached() {
      const maxMint = this.avatar.row.max_mint.toNumber()
      const nextMint = this.avatar.row.mint.toNumber() + 1
      return maxMint < nextMint
    },
    atomicMarket():string {
      const config = this.contract.config
      return `${activeNetwork().atomicMarket}/market?collection_name=${config?.collection_name.toString() || 'boidavatars'}&schema_name=${config?.avatar_schema.toString() || 'boidavatars'}&template_id=${this.avatar.row.template_id.toNumber()}`
    },
    atomicTemplate():string {
      // https://wax-test.atomichub.io/explorer/template/boidavatars4/417184
      const config = this.contract.config
      return `${activeNetwork().atomicMarket}/explorer/template/${config?.collection_name.toString() || 'boidavatars'}/${this.avatar.row.template_id.toNumber()}`
    },
    userOwned(): boolean {
      // @ts-ignore
      if ((this.atomic.accountAssets[this.avatar.row.template_id.toNumber()]?.length > 0 || false) && this.user.loggedIn.account && this.atomic.accountAssetsLoaded === this.user.loggedIn.account) return true
      else return false
    },
    rarityColor():string[] {
      const rarity = this.avatar.meta.rarityScore
      if (rarity === 1) return ['bg-grey-8']
      if (rarity === 2) return ['bg-green-8']
      if (rarity === 3) return ['bg-blue-8']
      if (rarity === 4) return ['bg-purple-8']
      if (rarity === 5) return ['bg-secondary', 'text-purple']
      else return ['bg-grey-10']
      return []
    },
    owned():number {
      if (!this.user.loggedIn) return 0
      return this.atomic.accountAssets[this.avatar.row.template_id.toNumber()]?.length || 0
    },
    mintButtonText():string {
      return `mint ${this.avatar.row.avatar_name.toString()} #${this.avatar.row.mint.toNumber() + 1}`
    },
    mintPrice():Asset {
      const row = this.avatar.row
      const edition = this.contract.editions[0]
      if (!edition) return Asset.from('0,TLM')
      const result = calculateMintPrice(this.avatar.row, edition.avatar_floor_mint_price)
      return result.price.mint_price
      // return calcMintPrice(row.base_price, row.modified.toDate(), row.rarity.toNumber(), edition.avatar_floor_mint_price)
    },
    mintedString():string {
      return this.avatar.row.mint.toString() + '/' + this.avatar.row.max_mint.toString()
    },
    // meta():TemplateData {
    //   return this.atomic.templateData[this.avatar.template_id.toNumber()]
    // },
    partRarity():Record<Elements, number> {
      const templates = Object.values(this.atomic.templateData).filter(el => el?.schemaName === this.contract.config?.parts_schema?.toString() || 'avatarparts').map(el => ({ meta: el?.immutableData as PartCardMeta, schemaName: el?.schemaName }))
      const parts = defaultPartsSet()
      Object.keys(parts).forEach((type) => {
        parts[type] = templates.find(el => el.meta.bodypart === type && el.meta.name === this.avatar.meta[type])?.meta.rarityScore || 0
      })
      return parts
    },
    partsMeta():Record<Elements, {meta:PartCardMeta, templateId:number}> {
      const templates = Object.entries(this.atomic.templateData)
        .filter(([key, val]) => val?.schemaName === this.contract.config?.parts_schema?.toString() || 'avatarparts')
        .map(([key, val]) => ({ meta: val?.immutableData as PartCardMeta, templateId: parseInt(key) }))
      const parts = defaultPartsSet()
      const data:Record<string, {meta:PartCardMeta, templateId:number}> = {}
      Object.keys(parts)
        .forEach((type) => {
          data[type] = templates.find(el => el.meta.bodypart === type && el.meta.name === this.avatar.meta[type]) || { meta: new PartCardMeta(), templateId: 0 }
        })
      return data
    }
  },
  methods: {
    async imgUrl():Promise<string> {
      return await ipfs(this.avatar.meta.img) as string
    },
    downloadImage,
    async mintAvatar() {
      await mintAvatar(this.avatar.row, this.mintPrice)
      await sleep(ms('3s'))
      this.$emit('minted')
    }
  },
  watch: {
    'browser.filter.showDetails': {
      handler(val) {
        this.showDetails = val
      },
      immediate: true
    },
    'user.loggedIn.account': {
      handler(val) {
        if (val) this.disableMint = false
        else this.disableMint = true
      },
      immediate: true
    }
  }
})
</script>

<style lang="sass" scoped>
a
  font-size: 20px
.titleBar
  background-color: #0786ad
  opacity: .2
  background-size: 10px 10px
  background-image: repeating-linear-gradient(45deg, #8dc7d9 0, #8dc7d9 1px, #0786ad 0, #0786ad 50%)
.actionBar
  background-color: black
  opacity: .1
  background-size: 10px 10px
  background-image: repeating-linear-gradient(45deg, #8dc7d9 0, #8dc7d9 1px, #0786ad 0, #0786ad 50%)
</style>
