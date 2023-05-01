import { boot } from 'quasar/wrappers'
import createApp from 'vue'
import VueKonva from 'vue3-konva'

export default boot(async({ app }) => { app.use(VueKonva) })
