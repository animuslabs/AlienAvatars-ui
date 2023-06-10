<template lang="pug">
q-page.bg-primary.relative-position(style="min-height:max-content;")
  avatars-browser

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
import { avatarBrowserState } from 'src/stores/AvatarBrowserStore'
import BrowserDetails from '../components/AvatarsBrowser/AvatarsBrowserDetails.vue'
import AvatarsBrowser from 'src/components/AvatarsBrowser/AvatarsBrowser.vue'
const randCache = <Record<string, number[]>>{}
function getRand(min, max) {
  return Math.random() * (max - min) + min
}
export default defineComponent({
  name: 'PageAvatarStage',
  components: { stage, FavoritesManager, ActionButton, StageDetails, PartsBrowser, PreviewCard, CreateTemplate, BrowserDetails, AvatarsBrowser },
  setup() { return { browser: avatarBrowserState(), contract: contractState(), atomic: atomicState(), designer: designerState(), user: useUser() } },
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
    void this.contract.getAvatars()
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
        // @ts-ignore
        const partIds = templateIds.map(templateId => this.atomic.accountAssets[templateId][0])
        // @ts-ignore
        await transact.createTemplate(this.templateName, partIds, Asset.from('10.00000000 WAX'))
      } catch (error) {
        console.error(error)
      }
    }
  },
  watch: {
    'user.loggedIn.account': {
      handler(val) {
        if (val) void this.atomic.getAccountAssets(val)
        else void this.atomic.clearAccountAssets()
      },
      immediate: false
    }
  }
})
</script>
