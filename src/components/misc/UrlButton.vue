<template lang="pug">
div
  q-btn(:label="label" @click="open" :color="color" :size="size" :dense="dense" :unelevated="unelevated")
    q-tooltip.bg-primary(anchor="top middle" self="top middle" :offset="[0, 35]" :delay="500")
      | {{ url }}
</template>

<script>
import { openURL } from 'quasar'
export default {
  name: 'UrlButton',
  props: {
    label: {
      type: String,
      default: 'click'
    },
    url: {
      type: String,
      default: 'https://google.com'
    },
    size: {
      type: String,
      default: 'md'
    },
    color: {
      type: String,
      default: 'primary'
    },
    dense: {
      type: Boolean,
      default: false
    },
    unelevated: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {}
  },

  methods: {
    openURL,
    open() {
      // validation
      this.openURL(this.url)
    }
  }
}
</script>
