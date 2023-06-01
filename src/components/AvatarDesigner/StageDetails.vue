<template lang="pug">
div.q-pt-sm

  q-item(v-if="showDetails" clickable v-for="(templateId,type) in designer.selectedParts" :key="`t_${type}`" @click="designer.setTab(type)" :dense="true" style="height:80px;").full-width.q-pa-xs
    .row.items-center.q-gutter-sm.no-wrap.full-width
      .col-auto(style="width:75px")
        .row
          q-img( :src="designer.selectedMeta[type].rawPath" spinner-color="white" style="height: 46px; width:66px;" fit="contain")
        .centered.q-mt-xs
          //- small.text-capitalize {{type}}
      .col-auto(style="max-width:150px;")
        h6.no-margin.text-capitalize {{type}}
        //- p.text-capitalize {{ type }}
        p.text-capitalize {{ designer.selectedMeta[type].rarity }} {{designer.selectedMeta[type].name}}
      .col-grow
      .row.items-center
        .col-auto.self-end
          .row.items-center
            //- q-icon(name="star" size="22px").q-mr-sm
            //- h6 {{ designer.selectedMeta[type].rarity }}
            div(style="width:70px;")
              .row.justify-end
                q-btn(v-if="!atomic.accountAssets[templateId]" label="buy" color="secondary" type="a" :href="atomicMarket(templateId)" target="_blank")
                q-icon(v-else name="check" color="positive" size="sm").q-mr-md
    q-separator(spaced color="white")
  q-btn(v-if="showDetails" label="hide details" style="height:60px;" @click="showDetails = false" icon="visibility_off" ).full-width
  q-btn(v-else label="show details" style="height:60px;" @click="showDetails = true" icon="visibility" ).full-width

</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { designerState } from 'src/stores/DesignerStore'
import { useAvatarEditor } from 'src/stores/AvatarEditorStore'
import urlButton from 'components/misc/UrlButton.vue'
import { atomicState } from 'src/stores/AtomicStore'
import { defineComponent } from 'vue'
import { AvatarPart } from 'src/types/avatarParts'
import { contractState } from 'src/stores/ContractStore'
import { atomicHubMarket } from 'src/lib/utils'

export default defineComponent({
  setup() { return { designer: designerState(), atomic: atomicState(), contract: contractState() } },
  components: { urlButton },

  data() {
    return {
      showDetails: true
    }
  },
  created() {
    if (this.$q.platform.is.mobile) this.showDetails = false
  },
  computed: {
    partData():{[key:string]:AvatarPart} {
      const returnData = {}
      for (const [type, templateId] of Object.entries(this.designer.selectedParts)) {
        const partData = atomicState().templateData[templateId]
        if (!partData) throw new Error("can't find part:" + templateId)
        returnData[type + templateId] = partData
      }
      return returnData
    }
  },
  methods: {
    atomicMarket(templateId:number):string {
      return atomicHubMarket(this.contract.config?.parts_schema?.toString() || 'avatarparts', templateId)
    }
  }

})
</script>
