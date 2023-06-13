
<template lang="pug">
.full-height
  //- div {{unclaimedFunds.value}}
  .centered.q-ma-md
    .col(style="max-width:950px").q-ma-md
      .row.q-mb-sm
        .col-auto
          h5 Unclaimed funds: {{unclaimedFunds}}
        .col-auto
          q-btn.q-ml-md(label="claim" color="white" :disable="disableClaim" @click="claimFunds()").bg-secondary
          q-tooltip(v-if="user.loggedIn.account != targetAccount")
            p Login as designer to claim
      q-separator(color="secondary").q-mb-sm
      .row.q-mb-lg
        p {{targetAccount}} can claim funds earned from template mints
      .row
        h5 Avatar Templates designed by {{targetAccount}} ( {{browser.visibleAvatars.length}} )
      q-separator(color="secondary").q-mb-sm
      .row
        p {{targetAccount}} earns 25% of the mint price when others mint from templates they designed
      .centered.q-mb-lg
        .col-auto
          avatar-row(v-for="(avatar,name) in browser.visibleAvatars" :avatar="avatar" :key="name" @minted="getData()" style="max-width:90vw" ).q-ma-md
      .row
        h5 Avatars owned by {{targetAccount}} ( {{browser.ownedAvatars.length}} )
        //- q-separator(vertical spaced color="teal-8")
        .col-grow
        q-btn(label="Inventory on Atomic Hub" icon="link" type="a" :href="atomicInventory" target="_blank")
      q-separator(color="secondary").q-mb-sm

      .centered.q-mb-lg
        .col-auto
          avatar-row(v-for="(avatar,name) in browser.ownedAvatars" :avatar="avatar" :key="name" @minted="getData()" style="max-width:90vw").q-ma-md
      .centered.q-ma-md(v-if="loading")
        q-spinner(size="50px")

</template>

<script lang="ts">

import { mapState, mapActions, mapWritableState, mapStores } from 'pinia'
import part from 'components/AvatarDesigner/AvatarPart.vue'
import filterOptions from 'components/AvatarsBrowser/AvatarsBrowserFilter.vue'
import urlButton from 'components/misc/UrlButton.vue'
import { QTabsProps } from 'quasar'
import { defineComponent, reactive, watch, watchEffect } from 'vue'
import { contractState } from 'src/stores/ContractStore'
import { atomicState, AvatarMeta, PartsMeta } from 'src/stores/AtomicStore'
import { designerState } from 'src/stores/DesignerStore'
import { avatarBrowserState, AvatarBrowserType, BrowserFilterParams } from 'src/stores/AvatarBrowserStore'
import AvatarRow from 'src/components/AvatarsBrowser/AvatarRow.vue'
import { Avatars } from 'src/types/avatarContractTypes'
import { globalState } from 'src/stores/GlobaleStore'
import { sleep } from 'src/lib/utils'
import { Asset, ExtendedAsset, Name } from 'anchor-link'
import { useUser } from 'src/stores/UserStore'
import { activeNetwork } from 'src/lib/config'
import * as transact from 'src/lib/transact'
import { calculateMintPrice } from 'src/lib/pricing'
const tabs: QTabsProps = {
  activeBgColor: 'secondary',
  activeColor: 'primary',
  indicatorColor: 'transparent',
  narrowIndicator: true,
  inlineLabel: true,
  shrink: true,
  stretch: true,
  contentClass: 'boid-tabs'
}

export default defineComponent({
  components: { part, filterOptions, urlButton, AvatarRow },
  setup() {
    return { user: useUser(), contract: contractState(), atomic: atomicState(), designer: designerState(), browser: avatarBrowserState(), global: globalState() }
  },
  data() {
    return {
      targetAccount: this.$route.params.accountName as string || ' ',
      loading: false
    }
  },
  async created() {
    this.$q.loading.show()
    this.atomic.accountAssets = reactive({})
    this.browser.$patch({ filter: new BrowserFilterParams() })
    this.browser.filter.creatorName = this.targetAccount

    this.browser.filter.showDetails = true
    await sleep(1500)
    await this.atomic.getAccountAssets(this.$route.params.accountName as string)
    await this.getData()
    this.$q.loading.hide()

  },
  computed: {
    atomicInventory():string {
      const config = this.contract.config
      const collection = config?.collection_name.toString() || 'alienavatars'
      const schema = config?.avatar_schema.toString() || 'alienavatars'
      const atomicHub = activeNetwork().atomicMarket
      return `${atomicHub}/profile/${this.targetAccount}?collection_name=${collection}&only_duplicate_templates=false&order=desc&schema_name=${schema}&sort=transferred#inventory`
    },
    disableClaim():boolean {
      if (useUser().loggedIn.account === this.targetAccount && this.unclaimedFunds.value > 0) return false
      else return true
    },
    unclaimedFunds():Asset {
      return this.contract.deposits.find(el => el.balance.quantity.symbol.toString() === this.contract.config?.payment_token.sym.toString())?.balance?.quantity || Asset.from('0.0000 TLM')
    },
    ownedTemplates():AvatarBrowserType[] {
      const avatarsRecord:Record<string, AvatarBrowserType> = {}
      const edition = contractState().editions.find(el => el.edition_scope.toString() === globalState().currentEdition)
      if (!edition) return []
      for (const row of this.contract.avatars[globalState().currentEdition]) {
        const templateId = row.template_id.toNumber()
        const templateData = this.atomic.templateData[templateId]
        if (!templateData) continue
        const meta = templateData.immutableData as AvatarMeta
        const stats = this.atomic.templateStats[templateId] || { burned: 0, issued: 0 }
        const price = calculateMintPrice(row, edition.avatar_floor_mint_price)
        if (!price) continue
        avatarsRecord[row.avatar_name.toString()] = { meta, row, stats, price: price.price.mint_price }
      }
      const list:AvatarBrowserType[] = Object.values(avatarsRecord)
      return list
    }
  },
  methods: {
    async claimFunds() {
      const contract = this.contract.config?.payment_token.contract || ''
      const claimable = ExtendedAsset.from({ contract, quantity: this.unclaimedFunds })
      await transact.withdraw(Name.from(this.targetAccount), claimable).catch(console.error)
      await sleep(4000)
      void this.getData()
      return
    },
    async getData() {
      console.log('refresh all data')
      this.loading = true
      await this.contract.getConfig()
      await this.contract.getEditions()
      await this.contract.getAvatars()
      void this.contract.getDeposits(Name.from(this.targetAccount))

      await this.atomic.getAccountAssets(this.$route.params.accountName as string)
      void this.atomic.getManyTemplateStats(Object.keys(this.browser.visibleAvatars).map(el => parseInt(el)))
      void this.atomic.getManyTemplateStats(Object.keys(this.browser.ownedAvatars).map(el => parseInt(el)))
      this.loading = false
    }
  }

})
</script>
