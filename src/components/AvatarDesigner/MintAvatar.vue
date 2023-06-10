<template>
  <div>
    <pre>{{ avatarData }}</pre>
    {{ checksum }}
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useUser } from 'src/stores/UserStore'
import { useUserData } from 'src/stores/UserDataStore'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MintAvatar',
  props: {
    avatarData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    checksum: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(useUserData, ['getUserDeposits']),
    ...mapState(useUser, ['getLoggedIn'])
  },
  methods: {
    ...mapActions(useUserData, ['fetchUserInventory']),

    mintavatar() {
      console.log('mint avatar action')
      // const action = {
      //   account: 'waxcontract1',
    }
  }
})
</script>
