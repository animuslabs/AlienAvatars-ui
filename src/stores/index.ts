import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persist'
import { init } from 'src/lib/linkManager'

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  pinia.use(persist)
  console.log('booting.....')
  init()
  return pinia
})
