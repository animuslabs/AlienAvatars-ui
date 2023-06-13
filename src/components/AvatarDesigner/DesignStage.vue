
<template lang="pug">
.centered.bg-black
  //- div {{ designer.selectedMeta }}
  .relative-position.q-ma-sm
    q-img(:src="frameUrl" v-if="!designer.selectedMeta.background.name.includes('Ghost')").absolute-center.z-top
    v-stage(ref="stage" :config="stageConfig")
      v-layer
        v-image(ref="background" :config="body.background")
        v-image(ref="legs" :config="body.legs")
        v-image(ref="torso" :config="body.torso")
        v-image(ref="head" :config="body.head")
        v-image(ref="top" :config="body.top")
        v-image(ref="equipment" :config="body.equipment")
        v-image(ref="frame" :config="frameConfig")
      v-layer(ref="tooltips")
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { defineComponent, watch, reactive } from 'vue'
import { BodyPartConfig, BodyType, designerState, SelectedMetaData } from 'src/stores/DesignerStore'
import { Elements } from 'src/types/avatarParts'
import { Stage } from 'konva/lib/Stage'
// import StageDetails from 'src/components/avatarmaker/StageDetails.vue'
import ActionButton from 'components/AvatarDesigner/ActionButton.vue'
import { deepClone, sleep } from 'src/lib/utils'
import Konva from 'konva'

async function animateImage(node: Konva.Node, reverse = false) {
  const duration = 0.1
  const params = reverse ? { opacity: 0, duration, offsetX: 20, easing: Konva.Easings.EaseInOut } : { opacity: 1, duration, offsetX: 0, easing: Konva.Easings.EaseInOut }
  node.to(params)
}

async function animateSlot(part:SelectedMetaData, image:any, vue:any) {
  vue.$nextTick(async() => {
    const torsoImg = (vue.$refs[part.part.type] as any).getNode() as Konva.Node
    await animateImage(torsoImg, true)
    await sleep(200)
    image.src = part.rawPath
  })
}

const stageConfig = { width: 0, height: 0 }
const body = new BodyType()
export default defineComponent({
  components: { ActionButton },
  setup() {
    const designer = designerState()
    const frameConfig = reactive(new BodyPartConfig())
    return { designer, frameConfig }
  },
  data() {
    return { stageConfig, body, scale: 0.258, modal: false }
  },
  mounted() {
    this.stageConfig.width = 1291 * this.scale
    this.stageConfig.height = 2002 * this.scale
  },
  computed: {
    newPartSelected():Record<string, number> {
      return Object.assign({}, this.designer.selectedParts) // this is needed to compare the old/new selected parts
    },
    frameUrl() {
      return `/frames/avatar_frame_${this.designer.rarity}.png`
    }
  },
  watch: {
    newPartSelected: {
      immediate: true,
      deep: true,
      async handler(newVal:Record<Elements, number>, oldVal:Record<Elements, number>|null) {
        for (const [type, templateId] of Object.entries(newVal)) {
          if (oldVal && oldVal[type] === templateId) continue
          // console.log('rendering', type, templateId)
          const selectedMeta = this.designer.selectedMeta[type]
          await this.drawImage(this.designer.selectedMeta[type])
          await this.drawFrame()
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
    async drawFrame() {
      const image = new window.Image()
      const frameUrl = `/frames/avatar_frame_${this.designer.rarity}.png`
      image.src = frameUrl
      void this.$nextTick(() => {
        const refs = this.$refs as any
        // console.log(refs)
        const stage: Stage = refs.stage.getStage()
        // image.height = stage.height()
        // image.width = stage.width()
        this.frameConfig.width = stage.width()
        this.frameConfig.height = stage.height()
      })
    },
    async drawImage(part:SelectedMetaData) {
      // console.log('drawData', part)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const t: string = part.part.type.replace(/-/g, '_')
      const image = new window.Image()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await animateSlot(part, image, this)

      // await sleep(200)
      image.onload = async() => {
        const torsoImg = (this.$refs[part.part.type] as any).getNode() as Konva.Node
        void animateImage(torsoImg, false)
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
  // background-image: url('/stage-bg.png')
  filter: blur(3px)
  height: 510px
  background-size: cover
  background-position: bottom 85px center
</style>
