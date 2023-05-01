<template lang="pug">
q-page
  .centered.q-mt-lg
    q-img(src="https://ipfs.animus.is/ipfs/QmdvYKdajPpLNGjSXMZiAGqCwCCyAAkjAaAaCU7xAhuZRi" style="width:200px; max-width: 95vw;")
    q-img(src="https://ipfs.animus.is/ipfs/QmdtGcfe9fiobjWLJuWqaAKkkv6zkM67R1L8uA5wqvLZP7" style="width:200px; max-width: 95vw;")
    q-img(src="https://ipfs.animus.is/ipfs/QmVyX5XTiH776hYG9CKMPRqiPM36WPGm8ePXewhHFe1o58" style="width:200px; max-width: 95vw;")
  .row.justify-center.q-pb-md.q-pt-md
    q-card.col-auto.q-ma-md(style='background: radial-gradient(circle, #756F8E 40%, #3E426D 100%)')
      .row.items-center.justify-center
        h6 How it works
      q-separator(color="secondary")
      .row.justify-center(style="max-width: 95vw; width:400px;")
        .col-auto
          ul.q-ma-md
            li #[strong Pack NFTs] can be opened to reveal #[strong Avatar Part NFTs].
            li Unique #[strong Avatar Templates] can be designed by combining #[strong Avatar Part NFTs].
            li Anyone can mint from #[strong Avatar Templates]. Pricing and rarity is determined by the the rarity rating of the parts used in the template.
            li 25% of profits from avatar minting goes to the account who designed the template. The remaining 75% BOID is burned.
            li #[strong Boid Avatars] act as a unique pass to participate in future #[strong Boid Universe] ecosystem.
    q-card.col-auto.q-ma-md(style='background: radial-gradient(circle, #756F8E 40%, #3E426D 100%)')
      .row.items-center.justify-center
        h6 Details
      q-separator(color="secondary")
      .q-ma-md
        strong Template creation cost (all rarities):
        h6 100,000 BOID
        q-markup-table(bordered flat style='background: radial-gradient(circle, #756F8E 40%, #3E426D 100%)')
          thead
            tr
              th.text-left Template Rarity
              th.text-left Initial Mint Price
              th.text-left Max Supply
            tr
              th.text-left 1 - Common
              th.text-left 1,000 BOID
              th.text-left 250
            tr
              th.text-left 2 - Uncommon
              th.text-left 8,000 BOID
              th.text-left 160
            tr
              th.text-left 3 - Rare
              th.text-left 27,000 BOID
              th.text-left 90
            tr
              th.text-left 4 - Ultra Rare
              th.text-left 64,000 BOID
              th.text-left 40
            tr
              th.text-left 5 - Legendary
              th.text-left 125,000 BOID
              th.text-left 10
  .centered
    q-card(style="width:800px; max-width:90vw")
      .row.items-center.justify-center(style='background: radial-gradient(circle, #756F8E 40%, #3E426D 100%)')
        h6 Frequently Asked Questions
      q-separator(color="secondary")
      q-list.q-pa-md(separator style='background: radial-gradient(circle, #756F8E 40%, #3E426D 100%)')
        q-expansion-item(:label="faqData[0]" v-for="faqData of faq" dark)
          //- q-separator(color="grey" inset)
          .q-pa-md
            .q-ml-lg {{faqData[1]}}

</template>

<script lang="ts" >
import { defineComponent, ref, reactive } from 'vue'
import { link } from 'src/lib/linkManager'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { atomicState } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import faq from 'src/lib/faq'
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
    return { atomic: atomicState(), contract: contractState() }
  },
  data() {
    return { link, events, timeAgo, faq }
  }
})
</script>
