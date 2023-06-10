import { makeElementsObj } from 'src/stores/DesignerStore'

export class PartOffset {
  'x' = 0
  'y' = 0
  'width' = 0
  'height' = 0
}
export const elementsList = ['equipment', 'top', 'head', 'torso', 'legs', 'background'] as const
export type Elements = typeof elementsList[number]

export class AvatarPart {
  type:Elements = 'head'
  'offset': PartOffset = new PartOffset()
  'rarity' = 0
  'name' = ''
  'ipfsCard' = ''
  'ipfsRaw' = ''
}
