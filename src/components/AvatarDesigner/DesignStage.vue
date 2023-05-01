
<template lang="pug">
div.relative-position.bg-black
  .stage-background
  div.full-width.absolute-bottom(style="overflow:hidden")
    .centered
      img(:src="'stage-fg.png'" style="margin-bottom: -1030px;")
  .centered.absolute-center(style="bottom:-233px;")
    v-stage(ref="stage" :config="stageConfig")
      v-layer
        v-image(ref="big_wings" :config="body.big_wings")
        v-image(ref="small_wings" :config="body.small_wings")
        v-image(ref="legs" :config="body.legs")
        v-image(ref="torso" :config="body.torso")
        v-image(ef="head" :config="body.head")
        v-image(ref="mouth" :config="body.mouth")
        v-image(ref="eyes" :config="body.eyes")
        v-image(ref="top" :config="body.top")
      v-layer(ref="tooltips")

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { defineComponent, watch, reactive } from 'vue'
import { BodyType, designerState, emptySelectedParts, SelectedMetaData } from 'src/stores/DesignerStore'
import { Elements } from 'src/types/avatarParts'
import { Stage } from 'konva/lib/Stage'
// import StageDetails from 'src/components/avatarmaker/StageDetails.vue'
import ActionButton from 'components/AvatarDesigner/ActionButton.vue'
import { deepClone } from 'src/lib/utils'
// import {}
const stageConfig = { width: 0, height: 0 }
const body = new BodyType()
export default defineComponent({
  components: { ActionButton },
  setup() {
    const designer = designerState()

    return { designer }
  },
  data() {
    return { stageConfig, body, scale: 0.24 }
  },
  mounted() {
    this.stageConfig.width = 2048 * this.scale
    this.stageConfig.height = 2048 * this.scale
  },
  computed: {
    newPartSelected():Record<string, number> {
      return Object.assign({}, this.designer.selectedParts) // this is needed to compare the old/new selected parts
    }
  },
  watch: {
    newPartSelected: {
      immediate: true,
      deep: true,
      handler(newVal:Record<Elements, number>, oldVal:Record<Elements, number>|null) {
        for (const [type, templateId] of Object.entries(newVal)) {
          if (oldVal && oldVal[type] === templateId) continue
          console.log('rendering', type, templateId)
          this.drawImage(this.designer.selectedMeta[type])
          // const findPartData = this.designer.parts.find(el => el.template_id === templateId && el.type === name)
          // if (!findPartData) {
          //   console.error('cant find part data in json', name, templateId)
          //   continue
          // }
          // this.drawImage(this.designer.selectedMeta[])
        }
      }
    }
  },
  methods: {
    drawImage(part:SelectedMetaData) {
      // console.log('drawData', part)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const t: string = part.part.type.replace(/-/g, '_')
      const image = new window.Image()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      image.src = part.rawPath
      image.onload = () => {
        // set image only when it is loaded
        this.body[t].image = image
        this.body[t].x = part.offset.x * this.scale - (part.offset.width * this.scale) / 2
        this.body[t].y = Math.abs(part.offset.y * this.scale) - (part.offset.height * this.scale) / 2
        this.body[t].width = part.offset.width * this.scale
        this.body[t].height = part.offset.height * this.scale
        this.body[t].draggable = false
        this.body[t].data = part
      }
    },
    download() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refs = this.$refs as any
      // console.log(typeof refs)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const stage: Stage = refs.stage.getStage() as Stage
      const uri = stage.toDataURL({
        pixelRatio: 2
      })
      const link = document.createElement('a')
      link.href = uri
      link.download = 'avatar.png'
      link.click()
    }
  }

})
</script>

<style lang="sass">
.stage-background
  background-image: url('/stage-bg.png')
  filter: blur(3px)
  height: 450px
  background-size: cover
  background-position: bottom 85px center
</style>
