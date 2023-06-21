import { PartCardMeta, atomicState } from 'src/stores/AtomicStore'
import { contractState } from 'src/stores/ContractStore'
import { activeNetwork } from 'src/lib/config'
import { Asset, UInt64 } from 'anchor-link'
import { AvatarPart } from 'src/types/avatarParts'
import { Rarities } from 'src/stores/DesignerStore'
import { Dialog } from 'quasar'
import AvatarRow from 'components/AvatarsBrowser/AvatarRow.vue'
import ms from 'ms'
import { Avatars } from 'src/types/avatarContractTypes'
import * as transact from 'src/lib/transact'

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

export function getCollection() {
  const config = contractState().config
  if (!config) throw (new Error('load contract config first'))
  const collection = config.collection_name.toString()
  return collection
}

export function showRarityAlert(rarityNeeded:Rarities) {
  Dialog.create({
    title: `Not holding ${rarityNeeded} Alien Worlds Tool NFT`,
    message: `You can't mint an Avatar Template of ${rarityNeeded} rarity
        because you are not holding an Alien Worlds tool NFT of ${rarityNeeded} rarity.
        Add a ${rarityNeeded} AW tool NFT to your account inventory and try again.`
  })
}

export function getEligibleToolAssetId(requiredRarity: Rarities): false|string {
  const tools = atomicState().ownedAwToolsByRarity[requiredRarity]
  const toolTemplateId = tools[0]
  if (!toolTemplateId) return false
  const toolAssets = atomicState().accountAssets[toolTemplateId]
  if (!toolAssets) return false
  const toolAssetId = toolAssets[0]
  if (!toolAssetId) return false
  return toolAssetId
}

export async function mintAvatar(avatarRow:Avatars, mintPrice:Asset) {
  const rarity = getRarityName(avatarRow.rarity.toNumber())
  const toolAssetId = getEligibleToolAssetId(rarity)
  if (!toolAssetId) return showRarityAlert(rarity)
  await transact.mintAvatar(avatarRow.avatar_name, mintPrice, UInt64.from(toolAssetId))
}

export function getRarityColor(rarityName:Rarities) {
  if (rarityName === 'Mythical') return '#FAAE6B'
  else if (rarityName === 'Legendary') return '#2249B4'
  else if (rarityName === 'Epic') return '#3A6BF1'
  else if (rarityName === 'Rare') return '#2249B4'
  else if (rarityName === 'Common') return '#2249B4'
}

export function getRarityName(rarNum:number):Rarities {
  if (rarNum === 1) return 'Common'
  else if (rarNum === 2) return 'Rare'
  else if (rarNum === 3) return 'Epic'
  else if (rarNum === 4) return 'Legendary'
  else if (rarNum === 5) return 'Mythical'
  else {
    // console.error('invalid rarity number: ' + rarNum)
    return 'Mythical'
  }
}
export function getRarityScore(rarity:Rarities):number {
  if (rarity === 'Common') return 1
  else if (rarity === 'Rare') return 2
  else if (rarity === 'Epic') return 3
  else if (rarity === 'Legendary') return 4
  else if (rarity === 'Mythical') return 5
  else {
    // console.error('invalid rarity number: ' + rarNum)
    return 5
  }
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

export function throwError(...args: (string|number)[]): never {
  const errorMessage = args.join(' ')
  throw new Error(errorMessage)
}

export function partMetaToAvatarPart(meta:PartCardMeta):AvatarPart {
  const part:AvatarPart = {
    ipfsCard: meta.img,
    ipfsRaw: meta.img2,
    name: meta.name,
    offset: JSON.parse(meta.offset),
    rarity: meta.rarityScore,
    type: meta.avatarpart
  }
  return part
}

export function avatarRarity(rarities:number[]):number {
  const totalRarities = rarities.reduce((sum, rarity) => sum + rarity, 0)
  const averageRarity = totalRarities / rarities.length
  return Math.floor(averageRarity)
}

export function templateMaxMint(rarityScore: number) {
  return Math.floor(5 * Math.pow(6 - rarityScore, 1))
}

export function templateBasePrice(edition_floor_mint:Asset, rarityScore:number):Asset {
  return Asset.from(edition_floor_mint.value * Math.pow(rarityScore, 2), contractState().currentConfig.payment_token.sym)
}

export function printAsset(asset: Asset): string {
  const assetString = asset.toString()
  const parts = assetString.split(' ')
  const amountString = parts[0]
  if (!amountString) return assetString
  const amount = parseFloat(amountString)
  const currency = parts[1]

  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  })

  return `${formattedAmount} ${currency}`
}
