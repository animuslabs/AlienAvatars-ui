<template lang="pug">
.centered
  q-card.q-ma-md.q-pa-sm.full-width(style="background: radial-gradient(circle, #756F8E 40%, #3E426D 100%")
    .row(style="height:150px;")
      .col-auto
        .row
          .col-auto(style="width:20px;").gt-sm
          .col-auto(style="min-width:250px;")
            .full-width(style="height:30px;" v-if="browser.filter.showDetails")

            .row.relative-position.cursor-pointer(@click="showFull=!showFull")
              q-img(:src="ipfs(avatar.meta.img)" style="pointer-events: none;" ref="avatarImage" )
              //-   q-tooltip(:delay="300" style="z-index: 9999999; height:340px; width:750px;" anchor="top middle" self="top middle" :offset="[0,400]" :key="avatar.row.avatar_name.toString()" v-model="showFull").bg-transparent
              //-     q-img( :src="ipfs(avatar.meta.img)" style="width:100%; height:100%; z-index: 9999999999999999; filter:drop-shadow(0px 0px 50px black)" ).absolute-center
              .absolute-top(style="left:0px;")
              .absolute-top-left(v-if="owned>0" style="min-width:35px; left:10px;").relative-position
              .absolute-top-right(v-if="owned>0" style="min-width:35px; height:36px; right:40px; top:-6px;").q-pa-sm.relative-position
                q-btn(v-if="userOwned" dense icon="download"  @click="downloadImage(ipfs(avatar.meta.img),avatar.row.avatar_name.toString()+'.png')" color="white")
                  q-tooltip
                    p Download Avatar Image
              .absolute-top-right(v-if="owned>0" style="min-width:35px; height:35px; right:10px;").bg-cyan-8.q-pa-sm.relative-position
                .row.items-center
                  h5.absolute-center(style="margin-top:2px;") {{owned}}
                    q-tooltip
                      p Account owns {{owned}} of this avatar
      .col
        .centered.q-gutter-md.q-ml-xl
          .col-auto
            .row
              p Avatar Tempalate Name
            .row
              .text-h4.text-capitalize {{avatar.row.avatar_name}}
          .col-auto
            .row
              p Template Designer
            .row
              .text-h4.text-capitalize {{avatar.row.creator}}

          .absolute-bottom(style="bottom:15px;" v-if="!browser.filter.showDetails")
            q-btn.full-width(:label="mintButtonText" size="lg" @click="mintAvatar()" :disable="disableMint")
          .col-auto(v-if="browser.filter.showDetails")
            .centered.q-gutter-sm.q-mt-sm.q-mb-sm
              .col-auto(style="width:20px;").gt-sm
              .col-auto
                  q-card.q-ma-sm.q-pa-md(style="min-width:310px;").full-height.boiddarkbg
                    .centered
                      p Traits | Rarity
                    q-separator(color="secondary" spaced)
                    .full-width.q-mb-md
                    .column.q-ml-sm
                      .row.items-center
                        .col-auto(style="width:95px;")
                          .row
                            div Top:
                          .row
                            a.text-capitalize.text-grey-3(:href="atomicHubTemplate(partsMeta['top'].templateId)" target="_blank") {{avatar.meta.top}}
                        .col-auto(style="width:15px")
                          h6 {{partsMeta.top.meta.rarity}}
                        q-separator(color="secondary" vertical spaced="15px")
                        .col-auto(style="width:110px;")
                          .row
                            div Torso:
                          .row
                            a.text-capitalize.text-grey-3(:href="atomicHubTemplate(partsMeta.torso.templateId)" target="_blank") {{avatar.meta.torso}}
                        .col-auto
                          h6 {{partsMeta.torso.meta.rarity}}
                    .q-mt-sm
                    .column.q-ml-sm
                      .row
                        .col-auto(style="width:95px;")
                          .row
                            div Head:
                          .row
                            a.text-capitalize.text-grey-3(:href="atomicHubTemplate(partsMeta.head.templateId)" target="_blank") {{avatar.meta.rarity}} {{avatar.meta.head}}
                        q-separator(color="secondary" vertical spaced="15px")
                        .col-auto(style="width:110px;")
                          .row
                            div Legs:
                          .row
                            a.text-capitalize.text-grey-3(:href="atomicHubTemplate(partsMeta.legs.templateId)" target="_blank") {{avatar.meta.legs}}
                        .col-auto(style="width:10px")
                          h6 {{partsMeta.legs.meta.rarityScore}}
              .col-auto
                q-card.q-ma-sm.q-pa-md(style="min-width:200px;").boiddarkbg
                  .centered
                    p Minting
                  q-separator(color="secondary" spaced)
                  .column.no-wrap
                    .row.q-gutter-sm
                      .col-auto.q-mr-sm
                        .row
                          div Last Mint:
                        .centered
                          p.q-pt-sm {{timeAgo.format(avatar.row.modified.toDate())}}
                          q-tooltip
                            p {{avatar.row.modified.toDate().toLocaleString()}}
                      q-separator(color="secondary" vertical spaced)
                      .col
                        .row
                          div Minted:
                        .centered
                          h5 {{mintedString}}
                    .row.q-mt-md
                      div Atomic Hub:
                    .centered.q-mt-sm
                      .col-auto
                        q-btn(label="template" :href="atomicTemplate" type="a" icon="link" target="_blank" size="md")
                      q-separator(vertical spaced color="secondary")
                      .col-auto
                        q-btn(label="market" :href="atomicMarket" type="a" icon="link" target="_blank" size="md")
                    //- q-separator(color="teal-10" spaced)
                    //- .col-grow
                    .row.q-mt-sm
                      div Price:
                    div(v-if="!maxSupplyReached")
                      .centered
                        h5 {{mintPrice}}

                      .centered.full-width
                        q-btn(:label="mintButtonText" size="lg" @click="mintAvatar()" :disable="disableMint").full-width
                        q-tooltip(v-if="!user.loggedIn.account")
                          p Login to mint
                    div(v-else).q-mb-md
                      .centered
                        h5 Max Supply Reached
            .col-auto(style="width:10px;").gt-sm
          //- .row(v-if="userOwned").items-center
            //- a( :href="'https://ipfs.animus.is/ipfs/'+ imgUrl" :download="`${'df'}.png`" target="_next") Download Profile Image

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { link } from 'src/lib/linkManager'
import { contractState } from 'src/stores/ContractStore'
import { atomicState, AvatarMeta, PartCardMeta, PartsMeta, TemplateData } from 'src/stores/AtomicStore'
import { Avatars } from 'src/types/avatarContractTypes'
import { activeNetwork } from 'src/lib/config'
import { globalState } from 'src/stores/GlobaleStore'
import { Asset, Name } from 'anchor-link'
import * as transact from 'src/lib/transact'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { avatarBrowserState, AvatarBrowserType } from 'src/stores/AvatarBrowserStore'
import { calcMintPrice, downloadImage, sleep, atomicHubTemplate } from 'src/lib/utils'
import { Elements } from 'src/types/avatarParts'
import { useUser } from 'src/stores/UserStore'
import { Dialog, QImg } from 'quasar'
import ms from 'ms'
import { defaultPartsSet } from 'src/stores/DesignerStore'
import ipfs from 'src/lib/ipfs'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')
export default defineComponent({
  setup() {
    return { atomicHubTemplate, contract: contractState(), atomic: atomicState(), timeAgo, browser: avatarBrowserState(), user: useUser(), ipfs }
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
      image: ''
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
      const edition = this.contract.currentEditionRow
      if (!edition) return Asset.from('0,BOID')
      return row.base_price
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
      await transact.mintAvatar(this.avatar.row.avatar_name, this.mintPrice)
      await sleep(ms('3s'))
      this.$emit('minted')
      // this.user.loggedIn.account
    }
  },
  watch: {
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
</style>
