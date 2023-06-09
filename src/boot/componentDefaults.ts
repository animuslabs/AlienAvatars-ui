/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { boot } from 'quasar/wrappers'
import { QInput, QBtn, QCard, QRouteTab, QTab, LocalStorage } from 'quasar'
// @ts-ignore
window.global ||= window

const chain = LocalStorage.getItem('chain')
if (!chain || chain != 'wax') {
  LocalStorage.clear()
  LocalStorage.set('chain','wax')
}

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.on(
    'vite:beforeUpdate',
    () => {
      // location.reload()
      // console.clear()
    }
  )
}

const setDefault = (component, key, value) => {
  const prop = component.props[key]
  switch (typeof prop) {
    case 'object':
      prop.default = value
      break
    case 'function':
      component.props[key] = {
        type: prop,
        default: value
      }
      break
    case 'undefined':
      throw new Error('unknown prop: ' + key)
    default:
      throw new Error('unhandled type: ' + typeof prop)
  }
}

export default boot(({ app }) => {
  console.log('component defaults')
  setDefault(QCard, 'square', false)
  setDefault(QCard, 'flat', true)
  setDefault(QCard, 'bordered', true)

  // setDefault(QInput, 'dense', true)
  // setDefault(QInput, 'outlined', true)
  // setDefault(QInput, 'stackLabel', true)
  // setDefault(QInput, 'hideBottomSpace', true)
  // setDefault(QInput, 'square', true)

  setDefault(QBtn, 'flat', true)
  setDefault(QBtn, 'unelevated', true)
  setDefault(QBtn, 'stretch', true)
  setDefault(QBtn, 'ripple', false)

  setDefault(QRouteTab, 'ripple', false)
})
