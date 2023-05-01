<template lang="pug">
q-page.bg-primary.relative-position
  div(v-if="!atomic.initialized")
    h5 loading
  div(v-else)
    .centered(style="height:90vh")
      .col(style="width:100vw; max-width:500px; min-width:300px;")
        //- q-separator(size="3px" color="grey-10")
        .row.items-center.no-wrap(style="height:50px;" v-if="!designer.createTemplateMode")
          q-btn-dropdown(label="favorites" contentStyle="margin:0px" stretch flat icon="favorite")
              favorites-manager
          //- q-btn(@click="designer.clearSelected()" icon="person_off") clear
          //- q-btn( @click="designer.shuffleSelected()" icon="shuffle") shuffle
          q-btn(@click="designer.clearSelected()" icon="person_off" label="clear" )
            q-tooltip
              p Clear
          q-btn( @click="designer.shuffleSelected()" icon="shuffle" label="shuffle" )
            q-tooltip
              p Shuffle
          .col-grow
          .col-auto.self-end.q-mr-md(style="height:100%")
            .row.items-center(style="height:100%")
              q-icon(name="star" size="20px").q-mr-sm
                q-tooltip(style="z-index: 999999999;")
                  p Avatar Rarity (Based on the highest rarity part)
              h6.no-margin {{designer.rarityScore}}
        q-scroll-area(style="height:90%; min-height: 590px;").relative-position.full-width
          .column.relative-position.full-width(style="overflow: hidden;").bg-primary
            stage.full-width(style="max-width:100vw")
            .centered.bg-secondary(v-if="!designer.createTemplateMode")
              .col-auto
                action-button(@minting="designer.createTemplateMode=true")
              .col-auto(style="width:20px;")
            //- q-separator(color="amber-12" size="1px")
            stage-details
      q-separator(vertical color="secondary" size="3px").gt-sm
      .col(style="min-width:300px; height:100vh; overflow: hidden;")
        div(v-if="!designer.createTemplateMode")
          parts-browser
        div(v-else)
          //- q-separator(size="3px" color="grey-10")
          create-template

</template>

<style lang="sass">
.template-name input
  height:60px
  padding-bottom:20px
  margin-bottom:20px

</style>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { designerState } from 'src/stores/DesignerStore'

import stage from 'components/AvatarDesigner/DesignStage.vue'
import FavoritesManager from 'src/components/AvatarDesigner/FavoritesManager.vue'
import ActionButton from 'src/components/AvatarDesigner/ActionButton.vue'
import StageDetails from 'src/components/AvatarDesigner/StageDetails.vue'
import { contractState } from 'src/stores/ContractStore'
import { atomicState } from 'src/stores/AtomicStore'
import PartsBrowser from 'components/AvatarDesigner/PartsBrowser.vue'
import { useUser } from 'src/stores/UserStore'
import PreviewCard from 'src/components/AvatarDesigner/PreviewCard.vue'
import { globalState } from 'src/stores/GlobaleStore'
import * as transact from 'src/lib/transact'
import { Asset } from 'anchor-link'
import CreateTemplate from 'src/components/CreateTemplate.vue'
const randCache = <Record<string, number[]>>{}
function getRand(min, max) {
  return Math.random() * (max - min) + min
}
export default defineComponent({
  name: 'PageAvatarStage',
  components: { stage, FavoritesManager, ActionButton, StageDetails, PartsBrowser, PreviewCard, CreateTemplate },
  setup() { return { contract: contractState(), atomic: atomicState(), designer: designerState(), user: useUser() } },
  data() {
    return {
      templateName: '',
      parts: [],
      templateNameValidation: [
        (value:string) => value.length < 13 || 'Name must be less than 13 characters',
        (value:string) => !value.search(/(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/) || 'invalid name',
        (value:string) => !contractState().avatars[globalState().currentEdition].find(el => el.avatar_name.toString() === value) || 'name not available'
      ]
    }
  },
  computed: {
    nameValid():boolean {
      return this.templateNameValidation.every(el => el(this.templateName) === true)
    },
    templateInput: {
      set(val:string):void {
        this.templateName = val
      },
      get():string {
        return this.templateName
      }
    }
  },
  mounted() {
    this.contract.getAvatars()
    // this.atomic.getAllParts()
    // this.atomic.getAllTemplates()
    // this.atomic.getAccountAssets()
    // this.selectRandomAvater()
    // console.log(this.getSelectedParts)
  },
  methods: {
    async createTemplate() {
      try {
        const templateIds = Object.values(this.designer.selectedParts)
        const partIds = templateIds.map(templateId => this.atomic.accountAssets[templateId][0])
        await transact.createTemplate(this.templateName, partIds, Asset.from('10.00000000 WAX'))
      } catch (error) {
        console.error(error)
      }
    },

    previewCardDynamic(rand:string) {
      if (!randCache[rand] || randCache[rand].length === 0) randCache[rand] = [getRand(-5, 5), getRand(-10, 10)]
      return {
        transform: `rotate(${randCache[rand][0]}deg)`,
        margin: '0px',
        'margin-left': `${randCache[rand][1]}px`
      }
    }
  },
  watch: {
    'user.loggedIn.account': {
      handler(val) {
        if (val) this.atomic.getAccountAssets(val)
        else this.atomic.clearAccountAssets()
      },
      immediate: true
    }
  }
})
</script>
