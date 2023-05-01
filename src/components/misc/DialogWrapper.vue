<template lang="pug">
div
  q-dialog(persistent v-model="show_dialog")
    q-card
      q-card-section.row.items-center.q-pb-none
        .text-h6
          slot(name="title")
        q-space
        q-btn(icon="close" flat round dense color="primary" @click="$emit('update:modelValue', false)")
      q-card-section
        slot(name="main" :hide="hide" :show="show")
</template>

<script>
export default {
  name: 'DialogWrapper',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show_dialog: false
    }
  },
  methods: {
    hide() {
      this.$emit('update:modelValue', false)
    },
    show() {
      this.$emit('update:modelValue', true)
    }
  },
  emits: ['update:modelValue', 'update:modelValue'],
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.show_dialog = newVal
        }
      }
    }
  }
}
</script>
