import { defineStore } from 'pinia'
import { designerState } from 'src/stores/DesignerStore'

export const useAvatarEditor = defineStore({
  id: 'AvatarEditor',
  state: () => ({
    // bookmarks: [{ name: "default", template_ids: [1, 2, 3] }],
    bookmarks: [],
    active_bookmark: ''
  }),
  persist: {
    enabled: true,
    strategies: [
      // { storage: sessionStorage, paths: ["firstName", "lastName"] },
      {
        key: 'ba-boidavatars-bookmarks',
        storage: localStorage,
        paths: ['bookmarks']
      }
    ]
  },
  getters: {},
  actions: {
    saveBookmark(name, template_ids) {
      console.error('bookmarks need fix')
      // TODO fix
      // const existing = this.bookmarks.find((b) => b.name === name)
      // console.log(existing)
      // if (existing) {
      //   existing.template_ids = template_ids
      // } else {
      //   this.bookmarks.unshift({ name, template_ids })
      // }
      // // this.bookmarks[checksum].template_ids = template_ids;
    },
    loadBookmark(name) {
      // const designer = designerState()
      // const existing = this.bookmarks.find((b) => b.name === name)
      // if (existing) {
      //   designer.selectFullAvatar(existing.template_ids)
      // }
    },
    deleteBookmark(name) {
      // const index = this.bookmarks.findIndex((b) => b.name === name)
      // if (index !== -1) {
      //   this.bookmarks.splice(index, 1)
      // }
    }
  }
})
