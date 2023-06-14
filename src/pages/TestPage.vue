<template lang="pug">
q-page
  div {{atomic.partsByType['eyes'].length}}
  div {{designer.visibleParts.length}}
  //- div {{[...new Set(designer.visibleParts)]}}
  div(v-for="part of designer.visibleParts")
    div {{ part.templateId}}
    q-img(:src="`https://ipfs.animus.is/ipfs/${part.meta.img}`" width="100px")
  div {{designer.activeTab}}
</template>

<script lang="ts" setup>
import { defineComponent, ref, reactive, markRaw } from 'vue'
import { link } from 'src/lib/linkManager'
import { atomicState } from 'src/stores/AtomicStore'

import { useRoute, useRouter } from 'vue-router'
import { designerState } from 'src/stores/DesignerStore'
const sleep = (ms:number) => new Promise(res => setTimeout(res, ms))

const atomic = atomicState()
const designer = designerState()

</script>
