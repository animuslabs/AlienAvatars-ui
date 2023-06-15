<template lang="pug">
.centered.full-width(style="max-width:80vw; zoom:75%;")
  q-card(:style="rowStyle").bg-grey-10.relative-position
    .absolute-right.z-top(v-if="!browser.filter.showDetails" style="right:0px; height:0px;" )
      q-btn(:icon="showDetails?'chevron_left':'chevron_right'" @click="showDetails = !showDetails").text-secondary.bg-accent
    .q-pa-sm.bg-secondary.relative-position
      .row.q-pr-sm.full-width
        .row.items-center.q-gutter-md.full-width
          //- p.text-capitalize Avatar Template
          .row.no-wrap(v-if="showDetails")
            h4.text-capitalize.q-pr-sm.no-margin(:style="rarityStyle") {{ avatar.meta.rarity  }}
            h4.text-capitalize.no-margin {{ avatar.row.avatar_name }}
          div(v-else)
            .row
              h6.text-capitalize.q-pr-sm.no-margin(:style="rarityStyle") {{ avatar.meta.rarity  }}
            .row
              h5.text-capitalize.no-margin {{ avatar.row.avatar_name }}
          .col-grow
          .row.no-wrap.items-center(v-if="showDetails")
            .row.no-wrap.q-mr-sm
              p Designer:
            .row.no-wrap
              h4.no-margin {{ avatar.row.creator }}
          .row(style="width:40px;" v-if="showDetails")
      .titleBar.absolute-top(style="height:100%; width:100%;")

    .row.q-mt-md
      .col.q-pl-md.q-pr-md(style="min-width:200px; width:400px;" v-if="showExtras")
        .centered.full-width
          q-img( no-transition v-if="showExtras" :src="imgUrl2" @click="showMaximized($event)" style="max-height:447px; max-width: 288px;").cursor-pointer
      .col(v-if="showDetails && showExtras" style="min-width:200px;")
        .q-pa-sm
          h5.text-center Traits
          q-separator(color="secondary")
          q-list.q-ma-md
            div(v-for="element of elementsList")
              .row
                p.text-capitalize {{ element }} - {{ getRarityName(partRarity[element])  }}
              .row(style="min-width:185px;")
                a(:href="atomicHubTemplate(partsMeta[element].templateId)" target="_blank").text-grey-4
                  h6.text-capitalize {{ avatar.meta[element] }}
      .col.relative-position(v-if="showDetails && showExtras" style="min-width:250px;")
        .q-pa-sm.q-ml-lg.q-mr-lg
          div(v-if="showDetails" style="min-width:200px;")
            h5.text-center Mint
            q-separator(color="secondary")
            .row.q-mt-md
              p Last Mint
            .row
              h5(style="font-size: 18px;") {{timeAgo.format(avatar.row.modified.toDate())}}
            .row
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
                h5(style="font-size: 15px;") {{printAsset(mintPrice)}}
            .centered.full-width.q-mt-lg
              q-btn.absolute.relative-position(:label="mintButtonText" size="lg" @click="mintAvatar()" no-wrap :disable="disableMint" color="accent" :flat="false" style=" width:250px; right:-2px; bottom: -2px; background-color: black;").text-cyan-9
              //- .actionBar.absolute-top(style="height:100%; width:100%;")
              q-tooltip(v-if="!user.loggedIn.account")
      div(v-if="!showDetails && showExtras").full-width.q-pb-lg
        .centered.full-width.q-ma-md
          h5 {{ printAsset(mintPrice) }}
        .centered.full-width.q-mt-sm.bg-accent
          q-btn(:label="mintButtonText" size="lg" @click="mintAvatar()" :disable="disableMint" color="accent" :flat="false" style="background-color: black;").text-cyan-9
      //- .row(style="height:458px; width:1px;").bg-red
      //- .centered.full-width(v-if="!showDetails")
      //-   h5 {{printAsset(mintPrice)}}
      //- .q-mt-sm
      //- div(id="overlay" @click="hideImage()").z-max
      //-   img(id="zoomed-image")

</template>

<script lang="ts">
import { atomicState, PartCardMeta } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import { defineComponent, PropType } from 'vue'

import { Asset } from 'anchor-link'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { Dialog, QImg } from 'quasar'
import { activeNetwork } from 'src/lib/config'
import ipfs from 'src/lib/ipfs'
import { calculateMintPrice } from 'src/lib/pricing'
import { atomicHubTemplate, downloadImage, getRarityName, mintAvatar, sleep, printAsset } from 'src/lib/utils'
import { avatarBrowserState, AvatarBrowserType } from 'src/stores/AvatarBrowserStore'
import { defaultPartsSet } from 'src/stores/DesignerStore'
import { useUser } from 'src/stores/UserStore'
import { Elements, elementsList } from 'src/types/avatarParts'
import ms from 'ms'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')
export default defineComponent({
  setup() {
    return { printAsset, getRarityName, elementsList, atomicHubTemplate, contract: contractState(), atomic: atomicState(), timeAgo, browser: avatarBrowserState(), user: useUser(), ipfs }
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
      showDetails: true,
      showExtras: true
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
      return (this.showDetails ? 'max-width:100%; width:897px;' : 'max-width:330px; ') + ' transition: all 80ms ease;' + ' max-height:660px;'
    },
    maxSupplyReached() {
      const maxMint = this.avatar.row.max_mint.toNumber()
      const nextMint = this.avatar.row.mint.toNumber() + 1
      return maxMint < nextMint
    },
    atomicMarket(): string {
      const config = this.contract.config
      return `${activeNetwork().atomicMarket}/market?collection_name=${config?.collection_name.toString() || 'boidavatars'}&schema_name=${config?.avatar_schema.toString() || 'boidavatars'}&template_id=${this.avatar.row.template_id.toNumber()}`
    },
    atomicTemplate(): string {
      // https://wax-test.atomichub.io/explorer/template/boidavatars4/417184
      const config = this.contract.config
      return `${activeNetwork().atomicMarket}/explorer/template/${config?.collection_name.toString() || 'boidavatars'}/${this.avatar.row.template_id.toNumber()}`
    },
    userOwned(): boolean {
      // @ts-ignore
      if ((this.atomic.accountAssets[this.avatar.row.template_id.toNumber()]?.length > 0 || false) && this.user.loggedIn.account && this.atomic.accountAssetsLoaded === this.user.loggedIn.account) return true
      else return false
    },
    rarityColor(): string[] {
      const rarity = this.avatar.meta.rarityScore
      if (rarity === 1) return ['bg-grey-8']
      if (rarity === 2) return ['bg-green-8']
      if (rarity === 3) return ['bg-blue-8']
      if (rarity === 4) return ['bg-purple-8']
      if (rarity === 5) return ['bg-secondary', 'text-purple']
      else return ['bg-grey-10']
      return []
    },
    owned(): number {
      if (!this.user.loggedIn) return 0
      return this.atomic.accountAssets[this.avatar.row.template_id.toNumber()]?.length || 0
    },
    mintButtonText(): string {
      return `mint ${this.avatar.row.avatar_name.toString()} #${this.avatar.row.mint.toNumber() + 1}`
    },
    mintPrice(): Asset {
      const row = this.avatar.row
      const edition = this.contract.editions[0]
      if (!edition) return Asset.from('0,TLM')
      const result = calculateMintPrice(this.avatar.row, edition.avatar_floor_mint_price)
      return result.price.mint_price
      // return calcMintPrice(row.base_price, row.modified.toDate(), row.rarity.toNumber(), edition.avatar_floor_mint_price)
    },
    mintedString(): string {
      return this.avatar.row.mint.toString() + '/' + this.avatar.row.max_mint.toString()
    },
    // meta():TemplateData {
    //   return this.atomic.templateData[this.avatar.template_id.toNumber()]
    // },
    partRarity(): Record<Elements, number> {
      const templates = Object.values(this.atomic.templateData).filter(el => el?.schemaName === this.contract.config?.parts_schema?.toString() || 'avatarparts').map(el => ({ meta: el?.immutableData as PartCardMeta, schemaName: el?.schemaName }))
      const parts = defaultPartsSet()
      Object.keys(parts).forEach((type) => {
        parts[type] = templates.find(el => el.meta.bodypart === type && el.meta.name === this.avatar.meta[type])?.meta.rarityScore || 0
      })
      return parts
    },
    partsMeta(): Record<Elements, { meta: PartCardMeta, templateId: number }> {
      const templates = Object.entries(this.atomic.templateData)
        .filter(([key, val]) => val?.schemaName === this.contract.config?.parts_schema?.toString() || 'avatarparts')
        .map(([key, val]) => ({ meta: val?.immutableData as PartCardMeta, templateId: parseInt(key) }))
      const parts = defaultPartsSet()
      const data: Record<string, { meta: PartCardMeta, templateId: number }> = {}
      Object.keys(parts)
        .forEach((type) => {
          data[type] = templates.find(el => el.meta.bodypart === type && el.meta.name === this.avatar.meta[type]) || { meta: new PartCardMeta(), templateId: 0 }
        })
      return data
    },
    imgUrl2(): string {
      return ipfs(this.avatar.meta.img)
    }
  },
  methods: {
    async hideImage() {
      var overlay = document.getElementById('overlay') as HTMLDivElement;

      overlay.style.display = 'none'
    },
    async showMaximized(image: HTMLImageElement) {
      var overlay = document.getElementById('overlay') as HTMLDivElement;
      var zoomedImage = document.getElementById('zoomed-image') as HTMLImageElement;
      var body = document.querySelector('body') as HTMLElement;
      var imagePopup = document.querySelector('.image-popup') as HTMLElement;

      zoomedImage.src = this.imgUrl2; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
      overlay.style.display = 'block';
      imagePopup.style.display = 'block';
      body.classList.add('disable-scroll');

      // Dialog.create({
      //   maximized: false,
      //   html: true,
      //   message: `
      //   <div class="centered q-pa-lg">
      //     <div>
      //     <div class="centered">
      //       <img src="${await this.imgUrl()}" style="margin:0px; max-height:80vh; max-width:100%" >  </img>
      //      </div>

      //     <div class="centered">
      //       <h4 class="text-capitalize"> ${this.avatar.meta.rarity} ${this.avatar.row.avatar_name.toString()} </h4>
      //     </div>
      //     </div>
      //   </div>
      //   `,
      //   class: 'bg-black no-outline',
      //   style: 'width:95vw; margin:30px; height:90%; overflow:hidden'

      // })
    },
    async imgUrl(): Promise<string> {
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
    async 'showDetails'(val) {
      if (val) {
        this.showExtras = false
        await sleep(100)
        this.showExtras = true
      } else {
        this.showExtras = false
        await sleep(100)
        this.showExtras = true

      }

    },
    'browser.filter.showDetails': {
      async handler(val) {
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
/* a
  font-size: 20px */


</style>
