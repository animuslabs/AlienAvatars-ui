<template lang="pug">
div
  q-item(v-if="showDetails" clickable v-for="(data,type) in designer.selectedMeta" :key="`t_${type}`" @click="designer.setTab(type)" :dense="true" style="height:80px;").full-width
    .row.items-center.q-gutter-lg.no-wrap.full-width
      .col-auto(style="width:65px")
        q-img(:src="data.rawPath" spinner-color="white" style="height: 46px; width:66px;" fit="contain")
      .col-auto(style="max-width:150px;")
        h6.no-margin.text-capitalize {{data.name}}
        p.text-capitalize {{ type }}
      .col-grow
      .col-auto.self-end
        .row.items-center
          q-icon(name="star" size="22px").q-mr-sm
          h6 {{ data.rarityScore }}
      .col-auto.self-end
        url-button(v-if="!atomic.accountAssets[data.templateId]" label="buy" color="positive" unelevated type="a" :href="atomicHubMarket(contract.currentConfig.parts_schema.toString(),data.templateId)")
        q-icon(v-else name="check" color="positive" size="sm")
    q-separator(spaced color="secondary")
  q-btn(v-if="showDetails" label="hide details" style="height:60px;" @click="showDetails = false" icon="visibility_off" ).full-width
  q-btn(v-else label="show details" style="height:60px;" @click="showDetails = true" icon="visibility" ).full-width

</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { SelectedMetaData, designerState } from 'src/stores/DesignerStore'
import { useAvatarEditor } from 'src/stores/AvatarEditorStore'
import urlButton from 'components/misc/UrlButton.vue'
import { atomicState } from 'src/stores/AtomicStore'
import { defineComponent } from 'vue'
import { AvatarPart, Elements } from 'src/types/avatarParts'
import { atomicHubMarket } from 'src/lib/utils'
import { contractState } from 'src/stores/ContractStore'

export default defineComponent({
  setup() { return { designer: designerState(), atomic: atomicState(), atomicHubMarket, contract: contractState() } },
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
    // atomicMarket(){
    //   atomicHubMarket
    // },
    partData():Record<Elements, SelectedMetaData> {
      return this.designer.selectedMeta
    }
  }

})
</script>
