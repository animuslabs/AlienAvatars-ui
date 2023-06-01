
<template lang="pug">
q-img(:src="data_uri" :no-spinner="!loading" id="sauce")
</template>

<script lang="ts">
/* eslint-disable vue/prop-name-casing */
/* eslint-disable vue/require-default-prop */
import { designerState } from 'src/stores/DesignerStore'
import { AvatarRenderer } from 'src/lib/avatarRenderer'
import { ref, toRefs, onMounted, computed, defineComponent, PropType } from 'vue'
import { AvatarPart, Elements, elementsList } from 'src/types/avatarParts'
import { atomicState, PartCardMeta } from 'src/stores/AtomicStore'
import { partMetaToAvatarPart } from 'src/lib/utils'

export default defineComponent({
  name: 'AvatarImage',
  props: {
    templateIds: Array as PropType<number[]>,
    parts: Array,
    partsSet: Object as PropType<Record<Elements, number>>
  },
  setup(props) {
    const data_uri = ref('')
    const loading = ref(false)
    const designer = designerState()
    const { templateIds, partsSet } = toRefs(props)

    async function getDataUrl() {
      loading.value = true
      if (!partsSet.value) return
      // const parts: AvatarPart[] = Object.entries(partsSet.value).map(([type, templateId]) => designer.parts.find(el => el.type === type && el.template_id === templateId) || new AvatarPart())
      const parts: AvatarPart[] = []
      for (const [type, templateId] of Object.entries(partsSet.value)) {
        const meta = atomicState().getTemplate(templateId)
        parts.push(partMetaToAvatarPart(meta.immutableData as PartCardMeta))
      }
      const AR = new AvatarRenderer(parts)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data_uri.value = await AR.getDataUrl()
      loading.value = false
    }

    onMounted(() => {
      getDataUrl()
    })

    return { data_uri, loading }
  }
})
</script>
