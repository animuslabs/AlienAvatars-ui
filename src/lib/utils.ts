import { atomicState } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import { activeNetwork } from 'src/lib/config'
import { Asset } from 'anchor-link'

export const sleep = (ms:number) => new Promise(res => setTimeout(res, ms))

export function atomicHubMarket(schemaName:string, templateId:number) {
  return activeNetwork().atomicMarket + `/market?collection_name=${contractState().config?.collection_name}&schema_name=${schemaName}&template_id=${templateId.toString()}`
}
export function atomicHubTemplate(templateId:number) {
  return `${activeNetwork().atomicMarket}/explorer/template/${contractState().config?.collection_name.toString() || 'boidavatars'}/${templateId}`
}
export function atomicHubSchemaMarket(targetSchema:string) {
  // https://wax-test.atomichub.io/market?collection_name=boidavatars4&order=desc&schema_name=partpacks&sort=created&symbol=WAX
  return `${activeNetwork().atomicMarket}/market?collection_name=${contractState().config?.collection_name.toString() || 'boidavatars'}&order=desc&schema_name=${targetSchema}`
}

export function deepClone<T>(val:T) {
  val = JSON.parse(JSON.stringify(val))
  return val
}

export function calcMintPrice(
  basePrice:Asset,
  lastModified:Date,
  rarity:number,
  floorMintPrice:Asset
):Asset {
  console.log('basePrice', basePrice)
  console.log('lastModified', lastModified)
  console.log('rarity', rarity)
  console.log('floorMintPrice', floorMintPrice)
  const now = Math.floor(Date.now() / 1000)
  const modified_sec = Date.parse(lastModified.toString()) / 1000
  if (now < modified_sec) throw new Error("avatar modified date can't be in the future")
  const days_passed = Math.floor((now - modified_sec) / 86400) // days since last modification
  const pv = basePrice.value
  const r = 0.01 * (5 / rarity)
  const decay_step = days_passed <= 7 ? 0 : days_passed - 7
  const p = pv * Math.pow(1 - r, decay_step)
  return Asset.from(Math.max(p, floorMintPrice.value), basePrice.symbol)
}

export async function downloadImage(imageSrc:string, name:string) {
  const image = await fetch(imageSrc)
  const imageBlog = await image.blob()
  const imageURL = URL.createObjectURL(imageBlog)

  const link = document.createElement('a')
  link.href = imageURL
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
