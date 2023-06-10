<template lang='pug'>
div
  Transition( name="fade" )
    .centered(v-if="unpacks.length>0 || loading")
      q-card( style="width:100%; max-width:90vw").q-ma-md.bg-boidgrey.q-pa-md.relative-position.text-white
        div
          .centered
            h5.no-margin You have cards ready to claim
          .centered
            div(v-for="unpack of unpacks").q-ma-md.full-width
              q-separator(color="white" size="1px").q-mb-md
              .centered
                h6.q-mb-md Opened: {{unpack.inserted.toDate().toLocaleString()}}
              .row.reverse.q-gutter-sm.justify-center.q-mr-xl.q-ml-lg
                .col-auto(v-if="unpack.claimable_template_ids.length>0" v-for="templateId of unpack.claimable_template_ids" style="width:80px;")
                  preview-card( :templateId="templateId.toNumber()" :style="previewCardDynamic(templateId.toString())")
                .col(v-else)
                  .centered.items-center
                    h5.no-margin Opening Pack
                    q-spinner(size="30px").q-ml-md
              .centered.full-width
                q-btn(:label="`Claim ${unpack.claimable_template_ids.length || ' '} Cards`" :disable="unpack.claimable_template_ids.length === 0" @click="claimCards(unpack.pack_asset_id)" icon="pan_tool" padding="10px" style="width:30%; min-width:200px;" size="md").q-mt-lg.bg-secondary
        div(v-if="unpacks.length>1")
          q-separator(color="white" size="1px").q-ma-md
          .centered
            q-btn.q-mb-lg(:label="`Claim all ${totalUnclaimed} Cards at once`" @click="claimAllCards(unpacks.map(el=> el.pack_asset_id))" icon="pan_tool" padding="15px" style="width:100%;" size="md").q-mt-lg.bg-secondary

</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { globalState } from 'src/stores/GlobaleStore'
import { link } from 'src/lib/linkManager'
import { useUser } from 'src/stores/UserStore'
import { contractState } from 'src/stores/ContractStore'
import { AssetData, atomicState, TemplateData, PackMeta } from 'src/stores/AtomicStore'
import PackCard from 'src/components/PackCard.vue'
import { claimPack, claimPacks } from 'src/lib/transact'
import { sleep } from 'src/lib/utils'
import ms from 'ms'
import { Unpack } from 'src/types/avatarContractTypes'
import PreviewCard from 'src/components/AvatarDesigner/PreviewCard.vue'
import { UInt64 } from 'anchor-link'
let interval
let interval2
let interval3
function getRand(min, max) {
  return Math.random() * (max - min) + min
}

const randCache = <Record<string, number[]>>{}

export default defineComponent({
  setup(props) {
    const loadAssets = ref(false)
    return { loadAssets, global: globalState(), user: useUser(), link, atomic: atomicState(), contract: contractState() }
  },
  data() {
    return {
      loading: false,
      loadingAssets: ref(false),
      status: 'status'
    }
  },
  async mounted() {
    this.contract.getPacks()
    if (!this.user.loggedIn.account) return
    this.contract.getUnpacks()
    // await this.getAccountAssets()

    // interval2 = setInterval(this.getAccountAssets, ms('5m'))
    // interval3 = setInterval(this.contract.getUnpacks, ms('30s'))
  },
  unmounted() {
    if (interval) clearInterval(interval)
    if (interval2) clearInterval(interval2)
    if (interval3) clearInterval(interval3)
  },
  methods: {
    packCardDynamic(rand: string) {
      // @ts-ignore
      if (!randCache[rand] || randCache[rand].length === 0) randCache[rand] = [getRand(-3, 4), getRand(-10, 10)]
      return {
        height: '300px',
        width: '200px',
        // @ts-ignore
        transform: `rotate(${randCache[rand][0]}deg)`,
        margin: '10px',
        // @ts-ignore
        'margin-left': `${randCache[rand][1]}px`
      }
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
    },
    async claimCards(packAssetId:UInt64) {
      try {
        await claimPack(packAssetId)
      } catch (error) {
        console.error(error)
      }
      await sleep(ms('2s'))
      this.contract.getUnpacks()
    },
    async claimAllCards(packAssetIds:UInt64[]) {
      try {
        await claimPacks(packAssetIds)
      } catch (error) {
        console.error(error)
      }
      await sleep(ms('2s'))
      this.contract.getUnpacks()
    },
    async getAccountAssets() {
      this.status = 'loading'
      try {
        const targetUser = this.user.loggedIn.account
        console.log('get account assets', targetUser)
        if (!targetUser) return
        await this.atomic.getAccountAssets(targetUser)
      } catch (error) {
        console.error(error)
      }

      this.status = 'done loading'

      // this.loadingAssets = ref(false)
    }
  },
  computed: {
    totalUnclaimed():number {
      return this.unpacks.reduce((prev, curr) => prev + curr.claimable_template_ids.length, 0)
    },
    unpacking():boolean {
      return this.unpacks.filter(el => el.claimable_template_ids.length === 0).length > 0
    },
    ownedPacks():{templateId:number, assetIds:string[], meta?:TemplateData, immutableData?:PackMeta}[] {
      try {
        const targetUser = this.user.loggedIn.account
        if (!targetUser) return []
        const packTemplates = this.contract.packs[this.global.currentEdition].map(el => parseInt(el.template_id.toString()))
        if (!packTemplates || packTemplates.length === 0) return []

        return packTemplates.map(el => {
          const assetIds = this.atomic.accountAssets[el] || []
          const meta = this.atomic.templateData[el]
          // if(!meta) meta = {}
          // @ts-ignore
          const immutableData = meta.immutableData as PackMeta

          return { templateId: el, assetIds, meta, immutableData } || []
        })
      } catch (error) {
        console.error(error)
        return []
      }
    },
    unpacks():Unpack[] {
      return [...this.contract.unpacks].sort((a, b) => a.inserted.toMilliseconds() - b.inserted.toMilliseconds())
    }
  },
  watch: {
    'user.loggedIn.account'(val) {
      if (val) {
        this.getAccountAssets()
        this.contract.getUnpacks()
      }
    },
    'unpacking'(val) {
      if (val) {
        if (interval) clearInterval(interval)
        interval = setInterval(() => this.contract.getUnpacks(), ms('2s'))
      } else if (interval) clearInterval(interval)
    },
    async 'unpacks'(val:Unpack[]) {
      for (const unpack of val) {
        for (const templateId of unpack.claimable_template_ids) {
          await this.atomic.loadTemplate(templateId.toNumber())
        }
      }
    },
    'loading'(val) {
      if (this.unpacks.length > 0) return
      if (val) interval = setInterval(() => this.contract.getUnpacks(), ms('2s'))
      else if (interval) clearInterval(interval)
    }
  },
  components: { PackCard, PreviewCard }
})
</script>
<style lang="sass">
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.5s ease
.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>
