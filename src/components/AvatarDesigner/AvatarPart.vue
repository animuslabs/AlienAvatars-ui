
<template lang="pug">
.centered.relative-position.items-center.q-ma-md
  //- Tilt(:options="tiltOptions" parallax )
  div
    q-img.cursor-pointer(
      :class="[isSelected? 'selected' : 'transparent-border']"
      :src="imgUrl"
      spinner-color="accent"
      width="12.5em"
      height="17em"
      placeholder-src="/loadingCard.webp"
      no-transition
      ref="img"
      fit="scale-down" @click="handlePartSelection()"
      @error="handleLoadError"
      )
    .lt-sm(style="height:40px; width:100%")
  div(v-if="ownedCount>0 && !designer.filter.showDetails" :label="ownedCount" style="top:-17px;right:-17px; height:40px;min-width:40px;").absolute.q-pa-sm.q-ma-sm.bg-info.bg-accent
    .centered
      p.no-margin  {{ownedCount}}
    q-tooltip
      p.no-margin You Own: {{ownedCount}}
  div(v-if="ownedCount>0 && designer.filter.showDetails" :label="ownedCount" style="top:-1px;right:-8px; height:40px;min-width:40px;").absolute.q-pa-sm.q-ma-sm.bg-info.bg-accent
    .centered
      p.no-margin  {{ownedCount}}
      //- p.no-margin Holding: {{ownedCount}}
    q-tooltip
      p You hold {{ownedCount}} of this card.
  div(v-if="designer.filter.showDetails" style="width:190px;")
    q-card( style="width:240px; height:190px; right:20px; z-index: -1000;").boiddarkbg.absolute
    div(v-if="designer.filter.showDetails" style="width:120px; height:190px; right:40px;" :class="[isSelected? 'infotext-margin' : 'infotext']").bg-transparent.q-pt-sm.full-width
      .row
        .text-h6.text-capitalize {{avatarPart.meta.rarity}}
      .row.full-width
        .text-h6.text-capitalize.ellipsis  {{detailSheet.name}}
      //- q-separator( color="amber-12")
      .row.q-gutter-md.q-pt-sm
        .col
          .small Issued
          .text-h6 {{detailSheet.stats.issued}}
        //- q-separator(vertical)
        .col
          .small Burned
          .text-h6 {{detailSheet.stats.burned}}
      .centered.no-wrap(style="width:180px; right:24px;").absolute
        div(:class="[isSelected? 'infotext-margin' : 'infotext']")
          .row.q-mt-sm
            q-btn.q-mt-sm( size="12px" dense  label="Template" type="a" target="_blank" :href="detailSheet.templateLink" )
            q-separator(vertical inset spaced)
            q-btn.q-mt-sm( size="12px" dense  label="Market" type="a" target="_blank" :href="detailSheet.marketLink" )
</template>

<style lang="sass">
.infotext
  margin-left:-5px
  transition: margin-left 250ms ease-out
.infotext-margin
  margin-left:20px
  transition: margin-left 50ms ease-in
.selected
  border: 3px solid transparent
  filter: drop-shadow(0px 10px 5px rgba(1,1,1,.5))
  box-shadow: 0 0 0 2px $accent
  transition: border 200ms ease-in
  transform: translateZ(150px)
  transform: scale(1.2)
  margin-right:30px
  padding: 10px
.transparent-border
  margin-right:20px
  border: 10px solid transparent
  transition: border 250ms ease-out
  filter: brightness(.8)

.info-part-table
  width: 100%
  border-collapse: collapse
.info-part-table tr:nth-child(even)
  background: $light-blue-1
.info-part-table tr:nth-child(odd)
  background: $light-blue-2
</style>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { mapActions } from 'pinia'
import { atomicState, PartsMeta, TemplateStats } from 'src/stores/AtomicStore'
import { designerState } from 'src/stores/DesignerStore'
import { useUserData } from 'src/stores/UserDataStore'
import { defineComponent, isReactive, PropType } from 'vue'
import { activeNetwork } from 'src/lib/config'
import { atomicHubMarket, atomicHubTemplate } from 'src/lib/utils'
import { contractState } from 'src/stores/ContractStore'
import { QImg } from 'quasar'
import ipfs from 'src/lib/ipfs'
export default defineComponent({
  setup() {
    return { isReactive, designer: designerState(), atomic: atomicState(), contract: contractState(), ipfs }
  },
  props: {
    avatarPart: {
      type: Object as PropType<PartsMeta>,
      required: true
    }
  },
  components: {},
  data() {
    return {
      view: 'image',
      info_is_loading: true,
      image: '/loadingCard.webp',
      error: false
    }
  },
  async created() {
    const img = this.$refs.img as QImg
    // img.on
    this.image = await this.imgUrl
    // console.log(this.atomic.templateIssued[this.avatarPart.templateId])
  },
  computed: {
    isSelected(): boolean {
      return this.designer.selectedParts[this.avatarPart.meta.avatarpart] === parseInt(this.avatarPart.templateId)
    },
    ownedCount(): number {
      return this.atomic.accountAssets[parseInt(this.avatarPart.templateId)]?.length || 0
    },
    detailSheet(): { marketLink: string, templateLink: string, name: string, stats: TemplateStats } {
      return {
        marketLink: atomicHubMarket(this.contract.config?.parts_schema.toString() || 'boidavatars', parseInt(this.avatarPart.templateId)),
        templateLink: atomicHubTemplate(parseInt(this.avatarPart.templateId)),
        name: this.avatarPart.meta.name,
        stats: this.atomic.templateStats[this.avatarPart.templateId] || { burned: 0, issued: 0 }
      }
    },
    imgUrl(): string {
      if (!this.error) return ipfs(this.avatarPart.meta.img2)
      else return ipfs(this.avatarPart.meta.img, true)
    }
  },
  methods: {
    handleLoadError() {
      console.log('handle load error', this.imgUrl)

      this.error = true
    },
    handlePartSelection() {
      this.designer.selectPart(parseInt(this.avatarPart.templateId), this.avatarPart.meta.avatarpart)
    }
  },
  watch: {
    async 'isSelected'() {
      // this.image = await this.imgUrl
    }
  }
})
</script>
