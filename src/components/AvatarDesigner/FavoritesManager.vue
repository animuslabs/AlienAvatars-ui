<template lang='pug'>
div
  q-list(separator)
    q-item
      q-item-section
        q-input(v-model="favoriteName" dense placeholder="new favorites name")
      q-item-section(side)
        q-btn(@click="saveFavorite()" icon="add" size="md" round color="positive" :unelevated="false" :flat="false" dense :disabled="!favoriteName.length")
          q-tooltip.bg-primary(:delay="500")
            | Save current stage as {{ favoriteName }}
    transition-group(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" tag="div")
      q-item(v-for="(partsSet,name) in designer.favorites" :key="name" @click="designer.loadFavorite(name)" clickable v-close-popup)
        //- q-item-section(avatar)
        //-   q-avatar(color="light-blue-3")
            //- avatar-image(:parts-set="partsSet" :scale="0.1")
        q-item-section {{ name }}
        q-item-section(side)
          q-btn(icon="delete" color="white" dense size="md" rounded @click="designer.rmFavorite(name)")
</template>
<script lang="ts" setup>
import { useAvatarEditor } from 'src/stores/AvatarEditorStore'
import { designerState } from 'src/stores/DesignerStore'
import AvatarImage from 'src/components/AvatarDesigner/AvatarImage.vue'
import { defineComponent, ref } from 'vue'
defineComponent({ AvatarImage })
const designer = designerState()
const favoriteName = ref('')

function saveFavorite() {
  console.log('save fav', favoriteName.value)

  designer.addFavorite(favoriteName.value, { ...designer.selectedParts })
}

</script>
<style lang="sass">
</style>
