
<template lang="pug">
.row.items-center.full-width(style="height:70px")
  q-spinner(v-if="loading" size="lg" color="white" key="loader")
  div(v-else)
    q-btn.pulse(size="xl" v-if="!existingTemplateData" :label="btnLabel" :disable="!isAllowedToCreateTemplate" key="create_template" @click="startMinting()" :loading="buttonsLoading" )
    .centered(v-else)
      .col-auto
        .row
          p.text-white This template is already owned by
        .centered
          p.text-strong {{existingTemplateData.creator.toString()}} named {{ existingTemplateData.avatar_name.toString() }}
  //-  dialog-wrapper(v-model="showMint")
  //-   template(#title)
  //-     | Mint Avatar
  //-   template(#main)
      //- mint-avatar(:avatar-data="existingTemplateData" :checksum="getChecksum")
  //- dialog-wrapper(v-model="show_create_template_dialog")
    template(#title)
      | Create Template
    template(#main="slotProps")
      //- create-template(:parts="parts" :checksum="getChecksum" @assembled="fetchAvatar" @test="slotProps.hide()")
</template>

<script lang="ts">
import { Serializer, Checksum256 } from 'anchor-link'
import dialogWrapper from 'components/misc/DialogWrapper.vue'
import mintAvatar from 'src/components/AvatarDesigner/MintAvatar.vue'
import { link } from 'src/lib/linkManager'
import { defineComponent } from 'vue'
import { designerState } from 'src/stores/DesignerStore'
import { atomicState } from 'src/stores/AtomicStore'
import { Avatars } from 'src/types/avatarContractTypes'
import { useUser } from 'src/stores/UserStore'
import { activeNetwork } from 'src/lib/config'
import { globalState } from 'src/stores/GlobaleStore'
import { Dialog } from 'quasar'

export default defineComponent({
  components: { dialogWrapper, mintAvatar },
  setup() {
    return { designer: designerState(), atomic: atomicState(), user: useUser() }
  },
  data() {
    return {
      link,
      existingTemplateData: null as Avatars | null,
      showMint: false,
      showCreate: false,
      loading: false
    }
  },
  computed: {
    btnLabel():string {
      const loggedIn = this.user.loggedIn.account
      if (!loggedIn) return 'Login to create Template'
      if (this.isAllowedToCreateTemplate && loggedIn) return 'Create Avatar Template'
      else return 'Missing parts'
    },
    getChecksum():Checksum256|null {
      const templateIds = Object.values(this.designer.selectedParts).sort()
      if (templateIds.includes(0)) return null
      const enc = Serializer.encode({ object: templateIds, type: 'uint32[]' }).hexString
      return Checksum256.hash(enc)
    },
    isAllowedToCreateTemplate(): boolean {
      return Object.values(this.designer.selectedParts).every((el) => Object.keys(this.atomic.accountAssets).find((el2) => el === parseInt(el2)))
    },
    buttonsLoading():boolean {
      return this.showMint || this.showCreate
    }
  },
  emits: ['minting'],
  methods: {
    triggerToolWarning() {
      Dialog.create({
        title: `Not holding ${this.designer.rarity} Alien Worlds Tool NFT`,
        message: `You can't create an Avatar Template of ${this.designer.rarity} rarity
        because you are not holding an Alien Worlds tool NFT of ${this.designer.rarity} rarity.
        Add a ${this.designer.rarity} AW tool NFT to your account inventory and try again.`
      })
    },
    startMinting() {
      console.log('minting')
      console.log(this.atomic.ownedAwToolsByRarity);
      const toolAvailable = this.atomic.ownedAwToolsByRarity[this.designer.rarity][0]
      if (!toolAvailable) return this.triggerToolWarning()
      this.$emit('minting')
    },
    async fetchAvatars() {
      if (!this.getChecksum) return
      this.loading = true
      // console.log(this.getChecksum.toString())

      const res = await this.link.rpc.get_table_rows({
        json: true,
        // @ts-ignore
        code: activeNetwork().contracts.avatarmk,
        scope: globalState().currentEdition,
        upper_bound: this.getChecksum,
        lower_bound: this.getChecksum,
        key_type: 'sha256',
        index_position: 'tertiary',
        table: 'avatars',
        limit: 1
      })
      // console.log(res)

      if (res?.rows.length === 1) this.existingTemplateData = Avatars.from(res.rows[0])
      else this.existingTemplateData = null
      this.loading = false
    }
  },
  watch: {
    getChecksum: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) void this.fetchAvatars()
      }
    }
  }
})

//   methods: {
//     async fetchAvatar() {
//       this.is_loading_avatar = true
//       const res = await this.link.rpc.get_table_rows({
//         json: true,
//         code: 'waxcontract1',
//         scope: 'waxcontract1',
//         upper_bound: this.getChecksum,
//         lower_bound: this.getChecksum, // _sha256.toString(),
//         key_type: 'sha256',
//         index_position: 3,
//         table: 'avatars',
//         limit: 1
//       })
//       await new Promise((resolve) => setTimeout(resolve, 250)) // add small delay to improve UX
//       if (res.rows?.length) {
//         // console.log(res);
//         this.existing_template_data = res.rows[0]
//         this.is_existing_template = true
//       } else {
//         this.existing_template_data = {}
//         this.is_existing_template = false
//       }

//       this.is_loading_avatar = false
//     }
//   },
//   // watch for checksum changes and query table
//   watch: {
//     getChecksum: {
//       immediate: true,
//       handler(newVal, oldVal) {
//         if (newVal !== oldVal) {
//           this.fetchAvatar()
//         }
//       }
//     }
//   }
// })
</script>
