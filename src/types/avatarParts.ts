export class PartOffset {
  'x' = 0
  'y' = 0
  'width' = 0
  'height' = 0
}
export type Elements = 'big-wings' | 'small-wings' | 'legs' | 'torso' | 'head' | 'mouth' | 'eyes' | 'top'
export const elementsList:Elements[] = ['big-wings', 'small-wings', 'torso', 'legs', 'top', 'head', 'mouth', 'eyes']
export class AvatarPart {
  type:Elements = 'big-wings'
  'offset': PartOffset = new PartOffset()
  'schema_name' = ''
  'template_id' = 0
  'rarity' = 0
  'name' = ''
  'ipfsCard' = ''
}

export const defaultSelectedMeta = {
  'big-wings': {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  'small-wings': {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  legs: {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  torso: {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  head: {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  mouth: {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  eyes: {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  },
  top: {
    offset: new PartOffset(),
    rawPath: '',
    templateId: 0,
    rarityScore: 0,
    name: '',
    cardIpfs: '',
    part: new AvatarPart()
  }
}
