import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import { init } from 'src/lib/linkManager'

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  console.log('booting.....')
  init()
  return pinia
})
