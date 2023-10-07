<template lang="pug">
.row.justify-center
  q-card.q-pa-md.full-width.position-relative(style='background: radial-gradient(circle, #756F8E 40%, #3E426D 100%)')
    .centered.items-center.q-gutter-md
      .col-auto
        q-toggle(label="Owned By Me" left-label color="white" v-model="browser.filter.ownedOnly"  :disable="!user.getLoggedIn")
      q-separator(vertical)
      .col-auto
        div
          span TLM
          q-btn.q-ml-sm(:icon="browser.filter.sortByPrice ? 'arrow_upward' : 'arrow_downward'" @click="browser.filter.sortByPrice = !browser.filter.sortByPrice;" size="md" round color="white" unelevated)
      q-separator(vertical)
      .col-auto
        q-toggle(label="Show Details" left-label color="white" v-model="browser.filter.showDetails")
      q-separator(vertical)
      .col-auto
        .row.items-center
          //- .gt-xs.p.q-mr-md(v-if="designer.filter.searchName?false:true") Name Filter:
          q-input( placeholder="Name Filter" v-model="browser.filter.searchName" color="secondary" style="padding-left:10px important!;  width:130px;" filled dense)
          q-btn(label="Clear Filter" @click="browser.filter.searchName= null" v-if="browser.filter.searchName?true:false" color="primary" :stretch="false" style="height:40px;").bg-secondary

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useUser } from 'src/stores/UserStore'
import { FilterType, designerState } from 'src/stores/DesignerStore'
import { avatarBrowserState } from 'src/stores/AvatarBrowserStore'

export default defineComponent({
  name: 'FilterOptions',
  setup() { return { user: useUser(), browser: avatarBrowserState() } },
  props: {
    modelValue: {
      type: Object as PropType<FilterType>,
      required: true
    }
  },
  data() {
    return {
      show_filter_options: true
    }
  },
  methods: {

  },
  emits: {
    'update:modelValue'(filterData:FilterType) {
      return filterData
    }
  }
})
</script>
