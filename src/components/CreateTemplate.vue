<template lang="pug">
div
  div(v-if="page===1")
    //- .centered.q-mt-lg
    //-   h5(style="text-transform: capitalize;") Create Avatar Template
    //- q-separator(color="cyan-10" spaced)
    div.q-ma-md
      .q-mt-lg
        q-card.q-ma-lg.q-pa-md.bg-grey-10
          .row.items-centered
            q-btn(label="< Back" @click="designer.createTemplateMode = false")
            .col-grow
              .centered.items-center.full-height
                h5.no-margin Creation Cost: {{templateCreationCost.toString()}}
            //- q-btn(style="background: #ffd73f; color: amber-12" label="Create Avatar Template" size="md" :disable="!nameValid" color="purple-10" icon="add" @click="createTemplate()")
          q-separator(color="secondary").q-mt-md
          .q-mt-lg.q-mb-md
            .centered
              q-input.q-mt-md.template-name( hide-bottom-space bottom-slots color="secondary" :rules="templateNameValidation" placeholder="TEMPLATE NAME" input-style="font-size:20px; text-align:center; margin:10px;"  v-model="templateInput")
                template(v-slot:hint)
                .relative-position.q-pt-lg
                  q-icon.absolute-center(v-if="nameValid" name="check" color="secondary" size="40px")
            .centered.q-mt-md
              p As the owner of this template you can assign a custom name.
            .centered
              p Name must be less than 13 characters. Name can include . and numbers 1-5.
            .centered.q-mt-lg
              q-btn(style="background: #ffd73f; color: secondary" label="Create Avatar Template" size="lg" :disable="!nameValid" color="primary" icon="add" @click="createTemplate()")
      h6 These Avatar Part NFTs will be burned to create your Avatar Template
      .row.reverse.q-gutter-sm.justify-center.q-mr-xl.q-ml-lg
        .col-auto( v-for="(templateId,type) of designer.selectedParts" style="width:60px;")
          PreviewCard(:templateId="templateId" :style="previewCardDynamic(templateId.toString())")
      //- .q-ma-md
      //-   h6 Template Stats:
      //-   .centered.q-gutter-md
      //-     .col-auto(style="width:140px;")
      //-       q-card.q-pa-md
      //-         .centered
      //-           h5 {{designer.rarity}}
      //-         .centered.q-mt-sm
      //-           p Rarity Rating
      //-     .col-auto(style="width:200px;")
      //-       q-card.q-pa-md
      //-         .centered
      //-           h5 {{startingMintPriceString}}
      //-         .centered
      //-           p Starting Mint Price
      //-     .col-auto(style="width:180px;")
      //-       q-card.q-pa-md
      //-         .centered
      //-           h5 50
      //-         .centered
      //-           p Maximum Supply
      //-   .q-mt-lg
      //-     h6 Pricing Details:
      //-     q-card.q-ma-lg.q-pa-md
      //-       p As the owner of this template you will receive 50% of the profits whenever someone mints from your avatar template. The mint price will start at 10000 BOID and increases each time the template is minted from more than once per day. If the template is not minted from for 7 days then the price will decay back to 1000 BOID. Once an avatar NFT is minted from a template it can be transfered and swapped on external markets.
  div(v-else-if="page===2")
    .centered.q-mt-lg
      h5(style="text-transform: capitalize;") Creating Avatar Template
    q-separator(color="secondary" spaced)
    .centered
      q-spinner(size="250px")
    .centered
      h6 Your template {{templateName}} is being created...
  div(v-else-if="page===3")
    q-scroll-area(style="height:100vh")
      .q-mb-xl
        .centered.q-mt-lg
          h5(style="text-transform: capitalize;") Pre Mint from new Template
        q-separator(color="secondary" spaced)
        .centered
          q-img(:src="imgUrl" style="width:300px;" )
        .centered
          h6 Say hello to {{templateName}}
        q-card.q-ma-md.q-pa-md
          p You now own an Avatar template. As the owner you have one hour to pre-mint an Avatar from this template before anyone else.
          h5.q-mt-sm.q-mb-sm Would you like to pre-mint the #1 mint from this template?
          p Mint cost: {{preMintCost||''}}
          .centered.q-gutter-md.items-center.q-mt-md
            q-btn(label="< Back to Designer" @click="designer.createTemplateMode = false")
            q-btn(label="mint #1 Avatar from this template" size="lg" color="cyan-8" @click="initPreMint()").bg-white
            q-btn(label="Visit Avatars page >" @click="$router.push({name:'browseAvatars'})")

</template>

<style lang="sass">
.template-name input
  height:60px
  padding-bottom:20px
  margin-bottom:20px

</style>

<script lang="ts">
import { designerState } from 'src/stores/DesignerStore'
import { defineComponent } from 'vue'

import { Asset, Name } from 'anchor-link'
import ActionButton from 'components/AvatarDesigner/ActionButton.vue'
import stage from 'components/AvatarDesigner/DesignStage.vue'
import FavoritesManager from 'components/AvatarDesigner/FavoritesManager.vue'
import PartsBrowser from 'components/AvatarDesigner/PartsBrowser.vue'
import { sleep, mintAvatar } from 'lib/utils'
import ms from 'ms'
import PreviewCard from 'src/components/AvatarDesigner/PreviewCard.vue'
import StageDetails from 'src/components/AvatarDesigner/StageDetails.vue'
import { activeNetwork } from 'src/lib/config'
import ipfs from 'src/lib/ipfs'
import { link } from 'src/lib/linkManager'
import { calculateMintPrice } from 'src/lib/pricing'
import * as transact from 'src/lib/transact'
import { AvatarMeta, atomicState } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import { globalState } from 'src/stores/GlobaleStore'
import { useUser } from 'src/stores/UserStore'
import { Avatars } from 'src/types/avatarContractTypes'
const randCache = <Record<string, number[]>>{}
function getRand(min, max) {
  return Math.random() * (max - min) + min
}
let interval
let avatarRow = null as Avatars | null
export default defineComponent({
  setup() { return { contract: contractState(), atomic: atomicState(), designer: designerState(), user: useUser(), global: globalState() } },
  components: { stage, FavoritesManager, ActionButton, StageDetails, PartsBrowser, PreviewCard },
  data() {
    return {
      page: 1,
      templateName: '',
      parts: [],
      createdTemplate: 0,
      templateNameValidation: [
        (value: string) => value.length < 13 || 'Name must be less than 13 characters',
        (value: string) => !value.search(/(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/) || 'invalid name',
        (value: string) => !contractState().avatars[globalState().currentEdition].find(el => el.avatar_name.toString() === value) || 'name not available'
      ]
    }
  },
  emits: ['finishMinting'],
  computed: {
    startingMintPriceString() {
      return ''
    },
    preMintCost(): Asset | null {
      if (this.createdTemplate === 0) return null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

      const editionData = this.contract.currentEditionRow
      if (!editionData) return null
      const avatarRow = this.contract.avatars[this.global.currentEdition].find(el => el.template_id.toNumber() === this.createdTemplate)
      if (!avatarRow) return null
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

      return calculateMintPrice(avatarRow, editionData.avatar_floor_mint_price).price.mint_price
    },
    getImg(): string {
      if (this.createdTemplate === 0) return ''
      const meta = this.atomic.templateData[this.createdTemplate]?.immutableData as AvatarMeta
      if (!meta) return ''
      return meta.img
    },
    imgUrl() {
      return ipfs(this.getImg)
    },
    nameValid(): boolean {
      return this.templateNameValidation.every(el => el(this.templateName) === true)
    },
    templateInput: {
      set(val: string): void {
        this.templateName = val
      },
      get(): string {
        return this.templateName
      }
    },
    templateCreationCost(): Asset {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = this.contract._editions.find((el: any) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        el.edition_scope === this.global.currentEdition)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result) return result.avatar_template_price
      else return Asset.from('0 LOADING')
    }
  },
  mounted() {
    void this.contract.getAvatars()
    void this.contract.getEditions()
  },
  unmounted() {
    if (interval) clearInterval(interval)
  },
  methods: {
    async initPreMint() {
      if (!this.preMintCost) return console.error('problem in initPremint')
      // await transact.mintAvatar(Name.from(this.templateName), this.preMintCost)
      const row = avatarRow
      if (!avatarRow) return console.error('error loading avatar row')
      await mintAvatar(avatarRow, this.preMintCost)
      this.designer.createTemplateMode = false
      await this.$router.push({ name: 'browseAvatars' })
    },
    async findCreatedTemplate() {
      const result = await link.rpc.get_table_rows({
        // @ts-ignore
        code: activeNetwork().contracts.avatarmk,
        table: 'avatars',
        scope: this.global.currentEdition,
        type: Avatars,
        lower_bound: Name.from(this.templateName),
        upper_bound: Name.from(this.templateName),
        limit: 1
      })
      console.log(result.rows)
      const newTemplate = result.rows[0]

      if (newTemplate) {
        avatarRow = newTemplate
        // @ts-ignore
        this.createdTemplate = newTemplate.template_id.toNumber() // eslint-disable-line @typescript-eslint/no-unsafe-member-access
        await this.contract.getAvatars()
        await this.atomic.loadTemplate(this.createdTemplate)
        await sleep(ms('5s'))
        this.page = 3
        if (interval) clearInterval(interval)
      }
    },
    async createTemplate() {
      try {
        const templateIds = Object.values(this.designer.selectedParts)
        // @ts-ignore
        const partIds = templateIds.map(templateId => this.atomic.accountAssets[templateId][0])
        // @ts-ignore
        await transact.createTemplate(this.templateName, partIds, this.templateCreationCost)

      } catch (error) {
        console.error(error)
      }
              void this.atomic.getAccountAssets()
        interval = setInterval(this.findCreatedTemplate, ms('2s'))
        this.page = 2
    },
    previewCardDynamic(rand: string) {
      // @ts-ignore
      if (!randCache[rand] || randCache[rand].length === 0) randCache[rand] = [getRand(-5, 5), getRand(-10, 10)]
      return {
        // @ts-ignore
        transform: `rotate(${randCache[rand][0]}deg)`,
        margin: '0px',
        // @ts-ignore
        'margin-left': `${randCache[rand][1]}px`
      }
    }
  },
  watch: {
    'user.loggedIn.account': {
      handler(val) {
        if (val) void this.atomic.getAccountAssets(val)
        else void this.atomic.clearAccountAssets()
      },
      immediate: true
    }
  }
})
</script>
