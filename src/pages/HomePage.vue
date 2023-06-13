<template lang="pug">
q-page.bg-primary
  .centered.q-pt-lg
    q-img(src="/aaBanner.webp" style="width:800px; max-width:auto; border:2px solid #0786ad;").q-ma-md

  .row.justify-center.q-pb-md
    q-card.col-auto.q-ma-md.bg-grey-10
      .row.items-center.justify-center.bg-secondary.relative-position.q-pa-sm
        h5 How it works
        .titleBar.absolute-top(style="height:100%; width:100%;")

      q-separator(color="secondary")
      .row.justify-center(style="max-width: 95vw; width:400px;")
        .col-auto
          ul.q-ma-md
            li #[strong Pack NFTs] can be opened to reveal #[strong Avatar Part NFTs].
            li Unique #[strong Avatar Templates] can be designed by combining #[strong Avatar Part NFTs].
            li #[strong Avatar Template] Rarity is determined by the the average rarity rating of the #[strong Avatar Parts] used in the template.
            li 25% of profits from avatar minting goes to the account who designed the template. You can claim your earnings on the Avatars page.
            li The price to mint from an #[strong Avatar Template] increases by 10% each time someone mints. If an Avatar Template is not minted for 24 hours then the price will drop 1%-5% (Common - Mythical) each day back to the initial starting price.
            li To create a template or mint from a template of a certain rarity you must hold an Alien Worlds tool NFT in your inventory of the coresponding rarity.

    q-card.col-auto.q-ma-md.bg-grey-10
      .row.items-center.justify-center.relative-position.bg-secondary.q-pa-sm
        h5 Details
        .titleBar.absolute-top(style="height:100%; width:100%;")

      q-separator(color="secondary")
      .q-ma-md
        strong Template creation cost (all rarities)
        h6 {{printAsset(templateCreationCost)}}
        q-markup-table( flat ).bg-grey-10
          thead
            tr
              th.text-left Template Rarity
              th.text-left Initial Mint Price
              th.text-left Max Supply
            tr
              th.text-left Common
              th.text-left {{ printAsset(basePrices.Common) }}
              th.text-left {{ maxMints.Common }}
            tr
              th.text-left Rare
              th.text-left {{ printAsset(basePrices.Rare) }}
              th.text-left {{ maxMints.Rare }}
            tr
              th.text-left Epic
              th.text-left {{ printAsset(basePrices.Epic) }}
              th.text-left {{ maxMints.Epic }}
            tr
              th.text-left Legendary
              th.text-left {{ printAsset(basePrices.Legendary) }}
              th.text-left {{ maxMints.Legendary }}
            tr
              th.text-left Mythical
              th.text-left {{ printAsset(basePrices.Mythical) }}
              th.text-left {{ maxMints.Mythical }}
  .centered
    q-card(style="width:800px; max-width:90vw")
      .row.items-center.justify-center.bg-secondary.q-pa-sm.relative-position
        h5 Frequently Asked Questions
        .titleBar.absolute-top(style="height:100%; width:100%;")
      q-separator(color="secondary")
      q-list.q-pa-md(separator).bg-grey-10
        q-expansion-item(:label="faqData[0]" v-for="faqData of faq" dark)
          //- q-separator(color="grey" inset)
          .q-pa-md
            .q-ml-lg {{faqData[1]}}
  .row.q-pb-xl

</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { link } from 'src/lib/linkManager'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { atomicState } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import faq from 'src/lib/faq'
import { calculateMintPrice } from 'src/lib/pricing'
import { Asset } from 'anchor-link'
import { Rarities, makeRarityObj, raritiesList } from 'src/stores/DesignerStore'
import { getRarityScore, printAsset, templateBasePrice, templateMaxMint } from 'src/lib/utils'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')
const events = [
  {
    id: 'Minted Avatar',
    printName: 'Minted Avatar',
    time: new Date()
  },
  {
    id: 'Minted Template',
    printName: 'Minted Template',
    time: new Date()
  },
  {
    id: 'sdfdsfdsf',
    printName: 'Minted Avatar',
    time: new Date()
  },
  {
    id: 'sdfdsfdsf',
    printName: 'Purchase XL pack',
    time: new Date()
  },
  {
    id: 'sdfdsfdsf',
    printName: 'Open Pack',
    time: new Date()
  },
  {
    id: 'sdfdsfdsf',
    printName: 'dsfsdfdsf',
    time: new Date()
  }
]
export default defineComponent({
  setup() {
    return { atomic: atomicState(), contract: contractState(), calculateMintPrice, printAsset }
  },
  data() {
    return { link, events, timeAgo, faq }
  },
  computed: {
    templateCreationCost():Asset {
      const price = this.contract.currentEditionRow?.avatar_template_price
      if (!price) return Asset.from('1000.0000 TLM')
      else return price
    },
    maxMints(): Record<Rarities, number> {
      const result = makeRarityObj<number>(0)
      for (const rarity of raritiesList) {
        result[rarity] = templateMaxMint(getRarityScore(rarity))
      }
      return result
    },
    basePrices(): Record<Rarities, Asset> {
      const result = makeRarityObj<Asset>(Asset.from('0.0 TLM'))
      const floorMint = this.contract.currentEditionRow?.avatar_floor_mint_price
      if (!floorMint) return result
      for (const rarity of raritiesList) {
        result[rarity] = templateBasePrice(floorMint, getRarityScore(rarity))
      }
      return result
    }
  }
})
</script>
